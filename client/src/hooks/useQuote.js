import { useState, useEffect } from 'react';

const QUOTES = [
  '"Alone we can do so little; together we can do so much."\n— Helen Keller',
  '"For we are made for co-operation, like feet, like hands, like eyelids, like the rows of the upper and lower teeth."\n— Marcus Aurelius',
  '"Nothing great was ever achieved without enthusiasm."\n— Ralph Waldo Emerson',
  '"If I have seen further, it is by standing upon the shoulders of giants."\n— Isaac Newton',
  '"No man is an island, entire of itself; every man is a piece of the continent, a part of the main."\n— John Donne',
  '"When a man does not know what harbour he is making for, no wind is the right wind."\n— Seneca',
  '"Only connect the prose and the passion, and both will be exalted."\n— E. M. Forster, Howards End',
  '"Attention is the rarest and purest form of generosity."\n— Simone Weil',
  '"Fellowship is life, and lack of fellowship is death."\n— William Morris, A Dream of John Ball',
  '"We are caught in an inescapable network of mutuality, tied in a single garment of destiny."\n— Martin Luther King Jr.'
];

// Use sessionStorage to sync quotes across pages during same session
const getQuoteIndex = () => {
  const stored = sessionStorage.getItem('syncboard_quote_index');
  const storedTime = sessionStorage.getItem('syncboard_quote_time');
  
  if (stored !== null && storedTime !== null) {
    const elapsed = Date.now() - parseInt(storedTime);
    // If less than 2 minutes have passed, return stored index
    if (elapsed < 120000) {
      return parseInt(stored);
    }
  }
  
  // Otherwise pick new random quote and reset timer
  const newIndex = Math.floor(Math.random() * QUOTES.length);
  sessionStorage.setItem('syncboard_quote_index', newIndex.toString());
  sessionStorage.setItem('syncboard_quote_time', Date.now().toString());
  return newIndex;
};

export function useQuote() {
  const [quoteIndex, setQuoteIndex] = useState(() => getQuoteIndex());
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      // After fade out, change quote and fade in
      setTimeout(() => {
        const newIndex = Math.floor(Math.random() * QUOTES.length);
        sessionStorage.setItem('syncboard_quote_index', newIndex.toString());
        sessionStorage.setItem('syncboard_quote_time', Date.now().toString());
        setQuoteIndex(newIndex);
        setIsVisible(true);
      }, 500); // Match fade-out duration
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    quote: QUOTES[quoteIndex],
    isVisible
  };
}