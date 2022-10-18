import {
  Container, Tab, Tabs
} from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import AddDonationForm from './AddDonationForm';
import DonationsTab from './DonationsTab';
import IntentTab from './IntentsTab';

export default function Donations() {
  const [currentTab, setTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  const tabs = [DonationsTab, IntentTab];
  const tabComponent = tabs[currentTab];
  return (
    <>
      <Container><AddDonationForm /></Container>
      <Container>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Donations" />
          <Tab label="Donation intents" />
        </Tabs>
      </Container>
      <Container children={tabComponent()}/>
    </>
  );
}
