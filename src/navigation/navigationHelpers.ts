type NavigationLike = {
  navigate: (screen: string) => void;
  getParent?: () => NavigationLike | undefined;
  getState?: () => { routeNames?: string[] } | undefined;
};

export const navigateToCheckStk = (navigation: unknown): void => {
  const sourceNavigation = navigation as NavigationLike;
  let currentNavigation: NavigationLike | undefined = sourceNavigation;

  while (currentNavigation) {
    const routeNames = currentNavigation.getState?.()?.routeNames ?? [];
    if (routeNames.includes('CheckStk')) {
      currentNavigation.navigate('CheckStk');
      return;
    }
    currentNavigation = currentNavigation.getParent?.();
  }

  sourceNavigation.navigate('CheckStk');
};
