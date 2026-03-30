import React, { useContext } from 'react';

export const NavContext = React.createContext();

export const useNav = () => useContext(NavContext);
