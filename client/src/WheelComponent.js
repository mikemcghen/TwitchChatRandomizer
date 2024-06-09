import React, { useEffect, useState } from 'react';
import { Wheel } from 'react-custom-roulette';

const WheelComponent = () => {
  const [data, setData] = useState([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/selected');
        const result = await response.json();
        console.log('Fetched result:', result); 
        let fetchedData = [];

        if (result && Object.keys(result).length > 0) {
          fetchedData = Object.entries(result).map(([key, value]) => ({
            option: `${value}`,
            style: { backgroundColor: getRandomColor(), textColor: getRandomColor() }
          }));
          console.log('Formatted fetched data:', fetchedData);
          setData(fetchedData);
        } else {
          setErrorMessage('Check your data or send "select" in chat. No data was received :(');
        }
      } catch (error) {
        console.error('Error fetching the messages:', error);
        setErrorMessage('Error fetching the messages.'); 
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const startSpin = () => {
    if (data.length > 0) {
      setPrizeNumber(Math.floor(Math.random() * data.length));
      setMustSpin(true);
    }
  };

  const handleSpinComplete = () => {
    setMustSpin(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (errorMessage) {
    return <div>{errorMessage}</div>;
  }

  console.log('Rendering Wheel with data:', data);

  return (
    <div>
      <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeNumber}
        data={data}
        spinDuration={.5}
        disableInitialAnimation={true} 
        onStopSpinning={handleSpinComplete}
      />
      <button onClick={startSpin} disabled={mustSpin || data.length === 0}>
        Start Spin
      </button>
    </div>
  );
};

export default WheelComponent;
