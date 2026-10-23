package com.shinseitraceabilitysystemmobile

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.keyence.autoid.sdk.SdkStatus
import com.keyence.autoid.sdk.scan.DecodeResult
import com.keyence.autoid.sdk.scan.ScanManager

class KeyenceScannerModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext), ScanManager.DataListener {
  private var scanManager: ScanManager? = null
  private var listenerRegistered = false

  override fun getName(): String = NAME

  @ReactMethod
  @Synchronized
  fun initialize(promise: Promise) {
    try {
      var manager = scanManager
      if (manager == null) {
        manager = ScanManager.createScanManager(reactApplicationContext)
        if (manager == null) {
          promise.reject("KEYENCE_UNAVAILABLE", "ScanManager tidak tersedia pada perangkat ini")
          return
        }
        scanManager = manager
      }

      val status = if (!listenerRegistered) {
        manager.addDataListener(this).also {
          listenerRegistered = it == SdkStatus.SUCCESS || it == SdkStatus.ALREADY_EXIST
        }
      } else {
        SdkStatus.SUCCESS
      }

      val result = Arguments.createMap().apply {
        putBoolean("ready", listenerRegistered)
        putString("status", status.toString())
      }
      promise.resolve(result)
    } catch (error: Throwable) {
      promise.reject("KEYENCE_INIT_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun startRead(promise: Promise) {
    try {
      val manager = scanManager
      if (manager == null) {
        promise.reject("KEYENCE_NOT_INITIALIZED", "Scanner belum diinisialisasi")
        return
      }
      promise.resolve(manager.startRead().toString())
    } catch (error: Throwable) {
      promise.reject("KEYENCE_START_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun stopRead(promise: Promise) {
    try {
      scanManager?.stopRead()
      promise.resolve(true)
    } catch (error: Throwable) {
      promise.reject("KEYENCE_STOP_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun isReading(promise: Promise) {
    try {
      promise.resolve(scanManager?.isReading == true)
    } catch (error: Throwable) {
      promise.reject("KEYENCE_STATUS_ERROR", error.message, error)
    }
  }

  @ReactMethod
  @Synchronized
  fun release(promise: Promise) {
    try {
      releaseScanner()
      promise.resolve(true)
    } catch (error: Throwable) {
      promise.reject("KEYENCE_RELEASE_ERROR", error.message, error)
    }
  }

  override fun onDataReceived(decodeResult: DecodeResult) {
    val event = Arguments.createMap().apply {
      putString("data", decodeResult.data)
      putString("codeType", decodeResult.codeType)
      putString("result", decodeResult.result.toString())
      putDouble("timestamp", System.currentTimeMillis().toDouble())
    }

    try {
      reactApplicationContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(EVENT_SCAN, event)
    } catch (_: Throwable) {
      // React context may already be shutting down.
    }
  }

  @ReactMethod
  fun addListener(eventName: String) = Unit

  @ReactMethod
  fun removeListeners(count: Int) = Unit

  override fun invalidate() {
    releaseScanner()
    super.invalidate()
  }

  @Synchronized
  private fun releaseScanner() {
    val manager = scanManager ?: return
    if (manager.isReading) {
      manager.stopRead()
    }
    if (listenerRegistered) {
      manager.removeDataListener(this)
    }
    manager.releaseScanManager()
    listenerRegistered = false
    scanManager = null
  }

  companion object {
    private const val NAME = "KeyenceScanner"
    private const val EVENT_SCAN = "KeyenceScan"
  }
}
