import bg from '../assets/Signinupbg.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);

    const orangeGradient = 'linear-gradient(90deg, #F5820D 0%, #FA4A06 100%)';
    const textGray = '#A09893';
    const DeFont = 'Satoshi';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errMsg = data.detail ? (typeof data.detail === 'string' ? data.detail : data.detail[0]?.msg) : 'Login failed';
                throw new Error(errMsg);
            }

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            alert('Login successful!');
            // navigate('/dashboard'); // Hoặc chuyển đến trang khác
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            gap: '35px'
        }}>

            {/* Background Image */}
            <img
                src={bg}
                alt="Welcome bg"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: -1
                }}
            />

            {/* Layout */}
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <div style={{
                width: 'auto',
                height: 'auto',
                boxSizing: 'border-box',
                padding: '50px 44px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                background: 'white',
                boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.15)',
                borderRadius: '30px',
                position: 'relative',
                transition: 'all 0.3s ease-in-out'
            }}>

                {/* Title */}
                <div style={{ width: 'auto', textAlign: 'center' }}>
                    <div style={{ color: '#CC4D08', fontSize: '18px', fontFamily: DeFont, fontWeight: '700', wordWrap: 'break-word' }}>Omni Platforms</div>
                    <div style={{ color: 'black', fontSize: '14px', fontFamily: DeFont, fontWeight: '400', wordWrap: 'break-word' }}>Your Personal Content Distributor</div>
                </div>

                {error && (
                    <div style={{ color: '#FA4A06', fontSize: '14px', fontFamily: DeFont, textAlign: 'center', fontWeight: '600' }}>
                        {error}
                    </div>
                )}

                {/* Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '320px', fontFamily: DeFont }}>

                    {/* Email */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Email Address</label>
                        <input
                            type="email"
                            placeholder="Peter@example.com"
                            style={inputStyle}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Password</label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="Enter your password"
                                style={{ ...inputStyle, paddingRight: '50px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: '#929292',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    fontFamily: DeFont,
                                    userSelect: 'none'
                                }}
                            >
                                {showPass ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '320px', alignSelf: 'center', fontFamily: DeFont }}>
                    <button
                        type="submit"
                        style={{
                            width: '100%', height: '40px', borderRadius: '14px', border: 'none',
                            background: orangeGradient, color: 'white', fontSize: '16px', fontWeight: '700',
                            cursor: 'pointer', boxShadow: '0px 4px 10px rgba(245, 130, 13, 0.2)', fontFamily: DeFont
                        }}
                    >
                        Sign In
                    </button>

                    <div style={{ fontSize: '12px', color: '#555' }}>
                        Don't have an account?{' '}
                        <span
                            onClick={() => navigate('/signup')}
                            style={{ color: '#e2480b', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Sign up
                        </span>
                    </div>
                </div>

            </div>
            </form>

        </div>
    );
}


// Reusable standard styling object for inputs
const inputStyle = {
    width: '100%',
    height: '42px',
    boxSizing: 'border-box',
    padding: '0 16px',
    background: '#F6EFEA',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#333',
    outline: 'none',
    fontFamily: 'Satoshi'
};
