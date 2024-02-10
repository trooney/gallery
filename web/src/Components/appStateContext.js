import React from 'react';

const AppStateContext = React.createContext({});

export const UserProvider = AppStateContext.Provider;
export const UserConsumer = AppStateContext.Consumer;
export default AppStateContext;
