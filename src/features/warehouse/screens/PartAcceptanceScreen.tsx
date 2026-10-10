import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import {
  ClipboardCheck, ScanBarcode, Search, Package, ChevronRight,
  CheckCircle2, AlertTriangle, MapPin, ChevronDown, X,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { WarehouseStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import Button from '../../../components/Button';
import WarehouseHeader from '../components/WarehouseHeader';
import InfoBanner from '../components/InfoBanner';
import {
  searchParts, fetchAreas, fetchCustomers, createPartAcceptance,
  getDefaultExpiredDate, getPartDisplayLocations,
} from '../services/partAcceptanceService';
import type {
  PartSearchResult, AreaItem, CustomerItem, CreatePartAcceptancePayload,
} from '../types';
import { showSuccess, showError } from '../../../services/toastService';
import { extractPartNo } from '../../../utils/barcode';

type Props = { navigation: NativeStackNavigationProp<WarehouseStackParamList, 'PartAcceptance'> };
type Step = 'search' | 'select' | 'detail';
const WH_AREAS = ['warehouse 1', 'warehouse 2', 'receiving'];

const PartAcceptanceScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState<Step>('search');
  const [partNoInput, setPartNoInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PartSearchResult[]>([]);
  const [selectedPart, setSelectedPart] = useState<PartSearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiredDate, setExpiredDate] = useState(getDefaultExpiredDate());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const barcodeRef = useRef<TextInput>(null);
  const inputValueRef = useRef('');

  const focusScanner = useCallback(() => {
    requestAnimationFrame(() => { barcodeRef.current?.focus(); });
  }, []);

  useFocusEffect(useCallback(() => {
    if (step === 'search') {
      const t = setTimeout(() => focusScanner(), 200);
      return () => clearTimeout(t);
    }
  }, [step, focusScanner]));

  useEffect(() => { loadFilterData(); }, []);

  const loadFilterData = async () => {
    setLoadingFilters(true);
    try {
      const [aRes, cRes] = await Promise.all([fetchAreas(), fetchCustomers()]);
      setAreas(aRes.filter(a => WH_AREAS.some(w => (a.name || '').toLowerCase().includes(w))));
      setCustomers(cRes);
    } catch (e) { console.log('Error loading filters:', e); }
    finally { setLoadingFilters(false); }
  };

  const filteredCustomers = customerSearch.trim()
    ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())) : customers;
  const filteredAreas = areaSearch.trim()
    ? areas.filter(a => a.name.toLowerCase().includes(areaSearch.toLowerCase())) : areas;


  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSearchPartNo = useCallback(async (overrideValue?: string) => {
    const rawValue = overrideValue !== undefined ? overrideValue : inputValueRef.current;
    // Parsing hasil scan: nilai barcode bisa berisi beberapa bagian
    // (dipisah spasi/baris baru) — gunakan bagian pertama saja sebagai Part No
    const targetValue = extractPartNo(rawValue);
    if (!targetValue) { showError('Masukkan Part No terlebih dahulu'); return; }
    // Tampilkan nilai yang sudah diparsing di input
    inputValueRef.current = targetValue;
    setPartNoInput(targetValue);
    setSelectedPart(null); setHasSearched(false); setSearchResults([]);
    setIsSearching(true);
    try {
      const results = await searchParts(targetValue);
      setHasSearched(true);
      if (results.length === 0) { showError('Part tidak ditemukan'); }
      else if (results.length === 1) {
        setSelectedPart(results[0]);
        setQuantity(results[0].qty ? String(results[0].qty) : '');
        setExpiredDate(getDefaultExpiredDate());
        setStep('detail');
      } else {
        setSearchResults(results);
        const matched = selectedCustomerId ? results.find(p => p.customer?.id === selectedCustomerId) : null;
        if (matched) {
          setSelectedPart(matched);
          setQuantity(matched.qty ? String(matched.qty) : '');
          setExpiredDate(getDefaultExpiredDate());
          setStep('detail');
        } else { setStep('select'); }
      }
    } catch (e: any) { showError(e?.response?.data?.message || 'Gagal mencari Part'); }
    finally { setIsSearching(false); }
  }, [selectedCustomerId]);

  const handleSelectPart = (part: PartSearchResult) => {
    setSelectedPart(part);
    setQuantity(part.qty ? String(part.qty) : '');
    setExpiredDate(getDefaultExpiredDate());
    setStep('detail');
  };

  const handleReset = useCallback(() => {
    inputValueRef.current = ''; setPartNoInput(''); setHasSearched(false); setSearchResults([]);
    setSelectedPart(null); setQuantity('');
    setExpiredDate(getDefaultExpiredDate()); setStep('search');
    focusScanner();
  }, [focusScanner]);

  const handleSubmit = useCallback(async () => {
    if (!selectedPart) { showError('Pilih Part terlebih dahulu'); return; }
    if (!selectedAreaId) { showError('Pilih Area terlebih dahulu'); return; }
    const qtyNum = Number(quantity);
    if (!quantity.trim() || isNaN(qtyNum) || qtyNum < 1) { showError('Quantity minimal 1'); return; }
    if (!expiredDate.trim()) { showError('Expired Date wajib diisi'); return; }
    setIsSubmitting(true);
    try {
      const isoExpired = new Date(expiredDate + 'T00:00:00').toISOString();
      const locs = getPartDisplayLocations(selectedPart);
      const payload: CreatePartAcceptancePayload = {
        inventoryCode: selectedPart.inventoryCode || selectedPart.code || '',
        quantity: qtyNum,
        supplierId: selectedPart.supplier?.id ?? 0,
        customerId: selectedPart.customer?.id ?? 0,
        expiredDate: isoExpired,
        areaId: selectedAreaId,
        pddm: selectedPart.inventoryCode || selectedPart.code || '-',
        rak: locs[0] ?? '',
        partNo: selectedPart.partNumber || '-',
      };
      const resp = await createPartAcceptance(payload);
      showSuccess(`Part Acceptance berhasil! STK: ${resp.data?.stkNumber || '-'}`, 'Sukses');
      handleReset();
    } catch (e: any) { showError(e?.response?.data?.message || 'Gagal membuat Part Acceptance'); }
    finally { setIsSubmitting(false); }
  }, [selectedPart, selectedAreaId, quantity, expiredDate, handleReset]);


  // ─── Render: Step Indicator ─────────────────────────────────────────────
  const renderStepIndicator = () => {
    const stepDefs = searchResults.length > 1
      ? [{ key: 'search', num: 1 }, { key: 'select', num: 2 }, { key: 'detail', num: 3 }]
      : [{ key: 'search', num: 1 }, { key: 'detail', num: 2 }];
    const order: Step[] = searchResults.length > 1 ? ['search', 'select', 'detail'] : ['search', 'detail'];
    const curIdx = order.indexOf(step);
    return (
      <View style={styles.stepIndicator}>
        {stepDefs.map((s, idx) => {
          const isActive = idx <= curIdx;
          const isCurrent = s.key === step;
          return (
            <React.Fragment key={s.key}>
              {idx > 0 && <View style={[styles.stepLine, isActive && styles.stepLineActive]} />}
              <View style={[styles.stepDot, isActive && styles.stepDotActive, isCurrent && styles.stepDotCurrent]}>
                <Text style={[styles.stepDotText, isActive && styles.stepDotTextActive]}>{s.num}</Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  // ─── Render: Customer Dropdown ───────────────────────────────────────────
  const renderCustomerDropdown = () => (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>Customer</Text>
      <TouchableOpacity activeOpacity={0.8} style={styles.filterDropdown}
        onPress={() => { setShowCustomerDropdown(!showCustomerDropdown); setShowAreaDropdown(false); }}>
        <Text style={[styles.filterDropdownText, !selectedCustomerId && styles.filterPlaceholder]} numberOfLines={1}>
          {selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.name || 'Semua' : 'Semua Customer'}
        </Text>
        {selectedCustomerId
          ? <TouchableOpacity onPress={() => setSelectedCustomerId(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><X color={colors.textMuted} size={16} /></TouchableOpacity>
          : <ChevronDown color={colors.textMuted} size={16} />}
      </TouchableOpacity>
      {showCustomerDropdown && (
        <View style={styles.dropdownContainer}>
          <TextInput style={styles.dropdownSearch} placeholder="Cari customer..." placeholderTextColor={colors.textMuted}
            value={customerSearch} onChangeText={setCustomerSearch} />
          <ScrollView style={styles.dropdownList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {filteredCustomers.length === 0
              ? <Text style={styles.dropdownEmpty}>Customer tidak ditemukan</Text>
              : filteredCustomers.map(c => (
                <TouchableOpacity key={c.id} activeOpacity={0.7}
                  style={[styles.dropdownItem, selectedCustomerId === c.id && styles.dropdownItemActive]}
                  onPress={() => { setSelectedCustomerId(c.id); setShowCustomerDropdown(false); setCustomerSearch(''); }}>
                  <Text style={[styles.dropdownItemText, selectedCustomerId === c.id && styles.dropdownItemTextActive]} numberOfLines={1}>{c.name}</Text>
                  {selectedCustomerId === c.id && <CheckCircle2 color={colors.success} size={16} />}
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  // ─── Render: Area Dropdown ───────────────────────────────────────────────
  const renderAreaDropdown = () => (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>Area Warehouse *</Text>
      <TouchableOpacity activeOpacity={0.8}
        style={[styles.filterDropdown, !selectedAreaId && styles.filterDropdownRequired]}
        onPress={() => { setShowAreaDropdown(!showAreaDropdown); setShowCustomerDropdown(false); }}>
        <Text style={[styles.filterDropdownText, !selectedAreaId && styles.filterPlaceholder]} numberOfLines={1}>
          {selectedAreaId ? areas.find(a => a.id === selectedAreaId)?.name || 'Pilih Area' : 'Pilih Area *'}
        </Text>
        <ChevronDown color={colors.textMuted} size={16} />
      </TouchableOpacity>
      {showAreaDropdown && (
        <View style={styles.dropdownContainer}>
          <TextInput style={styles.dropdownSearch} placeholder="Cari area..." placeholderTextColor={colors.textMuted}
            value={areaSearch} onChangeText={setAreaSearch} />
          <ScrollView style={styles.dropdownList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {filteredAreas.length === 0
              ? <Text style={styles.dropdownEmpty}>Area tidak ditemukan</Text>
              : filteredAreas.map(a => (
                <TouchableOpacity key={a.id} activeOpacity={0.7}
                  style={[styles.dropdownItem, selectedAreaId === a.id && styles.dropdownItemActive]}
                  onPress={() => { setSelectedAreaId(a.id); setShowAreaDropdown(false); setAreaSearch(''); }}>
                  <Text style={[styles.dropdownItemText, selectedAreaId === a.id && styles.dropdownItemTextActive]} numberOfLines={1}>{a.name}</Text>
                  {selectedAreaId === a.id && <CheckCircle2 color={colors.success} size={16} />}
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}
    </View>
  );


  // ─── Render: Step 1 - Search ─────────────────────────────────────────────
  const renderSearchStep = () => (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Search color={colors.primary} size={18} />
        <Text style={styles.stepTitle}>Langkah 1: Scan / Input Part No</Text>
      </View>
      <Text style={styles.stepDesc}>Scan atau masukkan Part No lalu tekan Enter untuk mencari.</Text>
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <TextInput style={styles.searchInput} placeholder="Masukkan Part No" placeholderTextColor={colors.textMuted}
            value={partNoInput}
            onChangeText={(text) => { inputValueRef.current = text; setPartNoInput(text); }}
            onSubmitEditing={() => handleSearchPartNo(inputValueRef.current)}
            returnKeyType="search" />
        </View>
        <TouchableOpacity activeOpacity={0.8}
          style={[styles.searchBtn, (isSearching || !partNoInput.trim()) && styles.searchBtnDisabled]}
          onPress={() => handleSearchPartNo(inputValueRef.current)} disabled={isSearching || !partNoInput.trim()}>
          {isSearching ? <ActivityIndicator color={colors.textInverse} size="small" /> : <Search color={colors.textInverse} size={18} />}
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Render: Step 2 - Select from multiple ──────────────────────────────
  const renderSelectStep = () => (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Package color={colors.orange} size={18} />
        <Text style={styles.stepTitle}>Langkah 2: Pilih Part ({searchResults.length} ditemukan)</Text>
      </View>
      <Text style={styles.stepDesc}>Ditemukan beberapa part. Pilih part yang diinginkan.</Text>
      <ScrollView style={styles.partList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
        {searchResults.map((item, idx) => {
          const locs = getPartDisplayLocations(item);
          return (
            <TouchableOpacity key={`${item.id}-${idx}`} activeOpacity={0.7} style={styles.partItem}
              onPress={() => handleSelectPart(item)}>
              <View style={styles.partItemLeft}>
                <View style={styles.partItemBadge}>
                  <Text style={styles.partItemBadgeText}>{item.inventoryCode || item.code || '-'}</Text>
                </View>
                <View style={styles.partItemInfo}>
                  <Text style={styles.partItemName} numberOfLines={1}>{item.partName || item.name || '-'}</Text>
                  <Text style={styles.partItemSub} numberOfLines={1}>{item.supplier?.name || '-'} · {item.customer?.name || '-'}</Text>
                  {locs.length > 0 && (
                    <View style={styles.partItemLocations}>
                      {locs.slice(0, 3).map((loc, lidx) => (
                        <View key={`${loc}-${lidx}`} style={styles.locationTag}>
                          <MapPin color={colors.primary} size={10} />
                          <Text style={styles.locationTagText} numberOfLines={1}>{loc}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={20} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );


  // ─── Render: Detail Step ─────────────────────────────────────────────────
  const renderDetailStep = () => {
    if (!selectedPart) return null;
    const locs = getPartDisplayLocations(selectedPart);
    const stepLabel = searchResults.length > 1 ? 'Langkah 3' : 'Langkah 2';
    return (
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <CheckCircle2 color={colors.success} size={18} />
          <Text style={styles.stepTitle}>{stepLabel}: Konfirmasi & Submit</Text>
        </View>
        <Text style={styles.stepDesc}>Periksa detail part, masukkan quantity dan expired date.</Text>

        <View style={styles.partInfoHeader}>
          <Text style={styles.partInfoPartNumber}>{selectedPart.partNumber || '-'}</Text>
          <View style={styles.partInfoBadge}><Text style={styles.partInfoBadgeText}>{selectedPart.inventoryCode || selectedPart.code || '-'}</Text></View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>PDDM</Text><Text style={styles.detailValue} numberOfLines={1}>{selectedPart.inventoryCode || selectedPart.code || '-'}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Part Name</Text><Text style={styles.detailValue} numberOfLines={1}>{selectedPart.partName || selectedPart.name || '-'}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Customer</Text><Text style={styles.detailValue} numberOfLines={1}>{selectedPart.customer?.name || '-'}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Supplier</Text><Text style={styles.detailValue} numberOfLines={1}>{selectedPart.supplier?.name || '-'}</Text></View>
        </View>

        {selectedCustomerId && selectedPart.customer?.id !== selectedCustomerId && (
          <View style={styles.warningBox}>
            <AlertTriangle color={colors.warning} size={16} />
            <Text style={styles.warningText}>{selectedPart.customer?.id ? `Customer tidak cocok. Part customer: ${selectedPart.customer.name}` : 'Part ini tidak memiliki customer.'}</Text>
          </View>
        )}

        <View style={styles.locationsSection}>
          <Text style={styles.sectionLabel}>Lokasi Rak</Text>
          {locs.length > 0 ? (
            <View style={styles.locationTags}>
              {locs.map((loc, idx) => (
                <View key={`${loc}-${idx}`} style={styles.locationBadge}>
                  <MapPin color={colors.primary} size={12} />
                  <Text style={styles.locationBadgeText}>{loc}</Text>
                </View>
              ))}
            </View>
          ) : <Text style={styles.noLocation}>Belum ada lokasi</Text>}
        </View>

        <View style={styles.formSection}>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Quantity *</Text>
              <TextInput style={styles.formInput} placeholder="Qty" placeholderTextColor={colors.textMuted}
                value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Expired Date *</Text>
              <TextInput style={styles.formInput} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted}
                value={expiredDate} onChangeText={setExpiredDate} />
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Button title="Reset" onPress={handleReset} variant="outline" style={styles.resetBtn} />
          <Button title="Submit Part" onPress={handleSubmit} isLoading={isSubmitting} disabled={isSubmitting} style={styles.submitBtn} />
        </View>
      </View>
    );
  };

  // ─── Main Return ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <WarehouseHeader title="Part Acceptance" subtitle="Terima part baru"
        icon={<ClipboardCheck color={colors.orange} size={18} />}
        iconBgColor={`${colors.orange}25`}
        onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <InfoBanner icon={<ScanBarcode color={colors.primary} size={20} />}
            text="Scan atau masukkan Part No untuk mencari part, lalu konfirmasi quantity dan expired date."
            bgColor={`${colors.primary}12`} />
          {renderStepIndicator()}
          <View style={styles.filtersSection}>{renderCustomerDropdown()}{renderAreaDropdown()}</View>
          {renderSearchStep()}
          {step === 'select' && renderSelectStep()}
          {step === 'detail' && renderDetailStep()}
          <TextInput ref={barcodeRef} value={partNoInput}
            onChangeText={(text) => { inputValueRef.current = text; setPartNoInput(text); }}
            autoFocus showSoftInputOnFocus={false} blurOnSubmit={false} returnKeyType="done"
            onSubmitEditing={() => handleSearchPartNo(inputValueRef.current)} style={styles.hiddenInput} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: `${colors.textMuted}20`, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotCurrent: { backgroundColor: colors.orange },
  stepDotText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  stepDotTextActive: { color: colors.textInverse },
  stepLine: { width: 40, height: 2, backgroundColor: `${colors.textMuted}20` },
  stepLineActive: { backgroundColor: colors.primary },
  filtersSection: { marginBottom: 16, gap: 12 },
  filterRow: { zIndex: 1 },
  filterLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  filterDropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: `${colors.textMuted}30`, ...shadows.sm },
  filterDropdownRequired: { borderColor: `${colors.warning}60` },
  filterDropdownText: { flex: 1, fontSize: 14, color: colors.textPrimary, marginRight: 8 },
  filterPlaceholder: { color: colors.textMuted },
  dropdownContainer: { marginTop: 4, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: `${colors.textMuted}20`, overflow: 'hidden', ...shadows.md },
  dropdownSearch: { paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: `${colors.textMuted}15` },
  dropdownList: { maxHeight: 180 },
  dropdownEmpty: { padding: 16, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: `${colors.textMuted}10` },
  dropdownItemActive: { backgroundColor: `${colors.success}10` },
  dropdownItemText: { flex: 1, fontSize: 14, color: colors.textPrimary, marginRight: 8 },
  dropdownItemTextActive: { fontWeight: '700', color: colors.success },
  stepCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: `${colors.textMuted}15`, ...shadows.sm },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  stepDesc: { fontSize: 13, color: colors.textSecondary, marginBottom: 14, lineHeight: 18 },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchInputWrapper: { flex: 1, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1.5, borderColor: `${colors.textMuted}30`, paddingHorizontal: 14 },
  searchInput: { height: 44, fontSize: 14, color: colors.textPrimary },
  searchBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  searchBtnDisabled: { opacity: 0.5 },
  partList: { maxHeight: 320 },
  partItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: `${colors.textMuted}12` },
  partItemLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginRight: 8 },
  partItemBadge: { backgroundColor: `${colors.primary}12`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, minWidth: 60, alignItems: 'center' },
  partItemBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  partItemInfo: { flex: 1 },
  partItemName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  partItemSub: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  partItemLocations: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  locationTag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: `${colors.primary}10`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  locationTagText: { fontSize: 10, color: colors.primary, fontWeight: '500', maxWidth: 100 },
  partInfoHeader: { alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: `${colors.textMuted}15`, marginBottom: 16 },
  partInfoPartNumber: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, letterSpacing: 0.5, marginBottom: 8, textAlign: 'center' },
  partInfoBadge: { backgroundColor: `${colors.primary}12`, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  partInfoBadgeText: { fontSize: 13, fontWeight: '700', color: colors.primary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  detailsGrid: { backgroundColor: colors.background, borderRadius: 12, padding: 12, marginBottom: 12, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  detailLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, maxWidth: '60%', textAlign: 'right' },
  warningBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: `${colors.warning}12`, borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: `${colors.warning}30` },
  warningText: { flex: 1, fontSize: 12, color: colors.warning, fontWeight: '500', lineHeight: 18 },
  locationsSection: { marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  locationTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${colors.primary}10`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: `${colors.primary}20` },
  locationBadgeText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  noLocation: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
  formSection: { backgroundColor: colors.background, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: `${colors.textMuted}15` },
  formRow: { flexDirection: 'row', gap: 12 },
  formField: { flex: 1 },
  formLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  formInput: { backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1.5, borderColor: `${colors.textMuted}30`, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.textPrimary },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 10,
  },

  submitBtn: {
    flex: 1.5,
    paddingVertical: 10,
  },
  doneScrollContent: { flexGrow: 1, justifyContent: 'center', padding: 32, paddingBottom: 60 },
  doneContainer: { alignItems: 'center' },
  doneIconBadge: { width: 96, height: 96, borderRadius: 48, backgroundColor: `${colors.success}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  doneTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  doneSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 28 },
  doneSummaryCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, width: '100%', marginBottom: 28, gap: 10, ...shadows.sm },
  doneSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  doneSummaryLabel: { fontSize: 13, color: colors.textSecondary },
  doneSummaryValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, maxWidth: '60%', textAlign: 'right' },
  doneSummaryValueStk: { fontSize: 15, fontWeight: '800', color: colors.primary, letterSpacing: 1, maxWidth: '60%', textAlign: 'right' },
  doneBtn: { width: '100%', paddingVertical: 14 },
});

export default PartAcceptanceScreen;

