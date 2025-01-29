import React from 'react';
// import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();  // Get the navigate function

  return (
    <div>
      {/* <Navbar/> */}
      <div>
        <h1>Hello</h1>
        {/* Use navigate to programmatically change the route */}
        <button onClick={() => navigate('/register')}>Register</button>
      </div>
    </div>
  );
}

export default Home;
