import { Tenant } from '@/hooks/useTenant';
import React, { useState } from 'react';

export const TenantsContext = React.createContext<{
  possibleTenants: Tenant[];
  currentTenant?: Tenant | null;
  setPossibleTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
}>({
  possibleTenants: [],
  currentTenant: null,
  setPossibleTenants: () => {},
});

export const TenantsContextProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [possibleTenants, setPossibleTenants] = useState<Tenant[]>([]);
  const currentTenant = possibleTenants[0] || null;

  return (
    <TenantsContext.Provider value={{ possibleTenants, setPossibleTenants }}>
      {children}
    </TenantsContext.Provider>
  );
};
TenantsContextProvider.displayName = 'TenantsContextProvider';

export const useTenantsContext = () => {
  const context = React.use(TenantsContext);
  if (!context) {
    throw new Error(
      'useTenantsContext must be used within a TenantsContextProvider'
    );
  }
  return context;
};
