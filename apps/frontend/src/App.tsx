import { useState } from 'react';
import './styles/index.css';
import './App.css';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RateCalculator } from './components/RateCalculator';
import { Features } from './components/Features';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';

export function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNote, setModalNote] = useState('');

  const handleOpenModal = (note?: string) => {
    setModalNote(note || '');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalNote('');
  };

  return (
    <div className="app-shell">
      <Navbar onOpenModal={() => handleOpenModal()} />
      <main>
        <Hero onOpenModal={() => handleOpenModal()} />
        <RateCalculator onOpenModal={handleOpenModal} />
        <Features />
      </main>
      <Footer />

      <ContactModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        initialNote={modalNote}
      />
    </div>
  );
}

export default App;
