window.WindowContent = function WindowContent({ id }) {
  switch(id) {
    case 'portfolio': return <PortfolioContent/>;
    case 'chat':      return <ChatContent/>;
    case 'account':   return <AccountContent/>;
    case 'settings':  return <SettingsContent/>;
    case 'payment':   return <PaymentContent/>;
    default: return null;
  }
};
