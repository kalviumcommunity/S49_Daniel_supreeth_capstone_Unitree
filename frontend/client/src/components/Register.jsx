import {useState,React} from 'react'
import './Register.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/register', { name, email, password })
            .then(result => console.log(result))
            .catch(err => console.log(err));
    };    
    return (
        <div className="signup-container">

          <div className="signup-box">
          <button onClick={() => navigate('/')} >back</button>
            <h2>Register</h2>
            <form onSubmit={handleSubmit} >
              <div className="form-group">
                <label htmlFor="name">
                  <strong>Name</strong>
                </label>
                <input
                  type="text"
                  placeholder="Enter Name"
                  autoComplete="off"
                  name="name"
                  className="form-control"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  <strong>Email</strong>
                </label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  autoComplete="off"
                  name="email"
                  className="form-control"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
    
              <div className="form-group">
                <label htmlFor="password">
                  <strong>Password</strong>
                </label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  name="password"
                  className="form-control"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
    
              <button type="submit" className="btn-register">
                Register
              </button>
    
              <p>Already Have an Account?</p>
    
              <button className="btn-login" onClick={()=>navigate("/Login")} >
                Login
              </button>
            </form>
          </div>
        </div>
      );
    }

export default Register