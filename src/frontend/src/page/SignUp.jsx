import bg from '../assets/Signinupbg.png'
import layoutbg from '../assets/signinuplayoutbg.png'
import bg2 from '../assets/Signinupbg2.png'
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignInUp() {
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState('Business'); // 'Personal' or 'Business'
    const [role, setRole] = useState('Manager'); // 'Manager' or 'Member'
    const [showPass1, setShowPass1] = useState(false);
    const [showPass2, setShowPass2] = useState(false);
    const [showPass3, setShowPass3] = useState(false);

    // New state variables for form inputs
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    // Business-only fields
    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaceId, setWorkspaceId] = useState('');
    const [workspacePin, setWorkspacePin] = useState('');

    // Common button/input style values matching the design
    const orangeGradient = 'linear-gradient(90deg, #F5820D 0%, #FA4A06 100%)';
    const lightBg = '#F6EFEA';
    const textGray = '#A09893';
    const DeFont = 'Satoshi';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

                // Base payload, matches RegisterRequest for the "individual" flow
        const payload = {
            username: username,
            email: email,
            password: password,
            account_type: accountType === 'Personal' ? 'individual' : 'business',
        };

        // Business flow needs extra fields depending on Manager vs Member
        if (accountType === 'Business') {
            payload.business_role = role.toLowerCase(); // 'Manager' -> 'manager', 'Member' -> 'member'
            payload.workspace_pin = workspacePin;

            if (role === 'Manager') {
                payload.workspace_name = workspaceName;
            } else {
                payload.workspace_id = workspaceId;
            }
        } 

        try {
            const response = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const errMsg = data.detail ? (typeof data.detail === 'string' ? data.detail : data.detail[0]?.msg) : 'Registration failed';
                throw new Error(errMsg);
            }

            alert('Registration successful! Redirecting to Sign In...');
            navigate('/signin');
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
            width: '100vw',
            margin: 0,
            padding: 0,
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

                    // Padding setup (top/bottom: 61px, left/right: 44px)
                    padding: '50px 44px',

                    // Layout for content inside the card
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',                   // 3. Set whatever gap distance you want between items here

                    // Visuals
                    background: 'white',
                    boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.15)',
                    borderRadius: '30px',
                    position: 'relative',
                    transition: 'all 0.3s ease-in-out'
                }}>

                    {/* Title */}
                    <div style={{
                        width: 'auto',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: '#CC4D08', fontSize: '18px', fontFamily: DeFont, fontWeight: '700', wordWrap: 'break-word' }}>Omni Platforms</div>
                        <div style={{ color: 'black', fontSize: '14px', fontFamily: DeFont, fontWeight: '400', wordWrap: 'break-word' }}>Your Personal Content Distributor</div>
                    </div>

                    {error && (
                        <div style={{ color: '#FA4A06', fontSize: '14px', fontFamily: DeFont, textAlign: 'center', fontWeight: '600' }}>
                            {error}
                        </div>
                    )}

                    {/* Choose role 1 */}
                    <div style={{ display: 'flex', gap: '16px', width: '300px', alignSelf: 'center' }}>
                        <button
                            type="button"
                            onClick={() => setAccountType('Personal')}
                            style={{
                                flex: 1, height: '40px', borderRadius: '12px', fontFamily: DeFont, border: accountType === 'Personal' ? 'none' : `1px solid ${textGray}`,
                                background: accountType === 'Personal' ? orangeGradient : 'white',
                                color: accountType === 'Personal' ? 'white' : '#333',
                                fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
                            Personal
                        </button>
                        <button
                            onClick={() => setAccountType('Business')}
                            style={{
                                flex: 1, height: '40px', borderRadius: '12px', fontFamily: DeFont, border: accountType === 'Business' ? 'none' : `1px solid ${textGray}`,
                                background: accountType === 'Business' ? orangeGradient : 'white',
                                color: accountType === 'Business' ? 'white' : '#333',
                                fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
                            Business
                        </button>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: accountType === 'Business' ? '40px' : '0px',
                        alignItems: 'stretch',
                        fontFamily: DeFont,
                        transition: 'gap 0.3s ease-in-out'
                    }}>
                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '300px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Username</label>
                                <input
                                    type="text"
                                    placeholder="How should we call you?"
                                    style={inputStyle}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Password</label>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <input
                                        type={showPass1 ? 'text' : 'password'}
                                        placeholder="The password should be longer than 8 characters"
                                        style={{ ...inputStyle, paddingRight: '50px' }}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass1(!showPass1)}
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
                                        {showPass1 ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Reenter Password</label>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <input
                                        type={showPass2 ? 'text' : 'password'}
                                        placeholder="Confirm your password"
                                        style={{ ...inputStyle, paddingRight: '50px' }}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass2(!showPass2)}
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
                                        {showPass2 ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Separator line */}
                        <div style={{
                            width: accountType === 'Business' ? '1px' : '0px',
                            backgroundColor: '#000000',
                            opacity: accountType === 'Business' ? 0.15 : 0,
                            transition: 'width 0.3s ease-in-out, opacity 0.3s ease-in-out'
                        }}></div>

                        {/* Right Column */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            width: accountType === 'Business' ? '300px' : '0px',
                            opacity: accountType === 'Business' ? 1 : 0,
                            overflow: 'hidden',
                            transition: 'width 0.3s ease-in-out, opacity 0.3s ease-in-out',
                            pointerEvents: accountType === 'Business' ? 'auto' : 'none'
                        }}>
                            {/* Choose role 2 */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                width: '100%', height: '46px', borderRadius: '16px', boxSizing: 'border-box', fontFamily: DeFont
                            }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>You are?</span>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => setRole('Manager')}
                                        style={{
                                            padding: '8px 0', borderRadius: '12px', border: 'none', fontFamily: DeFont, width: '110px',
                                            background: role === 'Manager' ? orangeGradient : 'transparent',
                                            color: role === 'Manager' ? 'white' : '#333',
                                            border: role === 'Manager' ? 'none' : `1px solid ${textGray}`,
                                            fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'center'
                                        }}
                                    >
                                        Manager
                                    </button>
                                    <button
                                        onClick={() => setRole('Member')}
                                        style={{
                                            padding: '8px 0', borderRadius: '12px', border: 'none', fontFamily: DeFont, width: '110px',
                                            background: role === 'Member' ? orangeGradient : 'transparent',
                                            color: role === 'Member' ? 'white' : '#333',
                                            border: role === 'Member' ? 'none' : `1px solid ${textGray}`,
                                            fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'center'
                                        }}
                                    >
                                        Member
                                    </button>
                                </div>
                            </div>

                            {/* Unified customized right column inputs */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                                        {role === 'Manager' ? 'Workspace name' : 'Workspace ID'}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={role === 'Manager' ? 'Workspace name' : 'Workspace ID'}
                                        style={inputStyle}
                                        value={role === 'Manager' ? workspaceName : workspaceId}
                                        onChange={(e) =>
                                            role === 'Manager'
                                                ? setWorkspaceName(e.target.value)
                                                : setWorkspaceId(e.target.value)
                                        }
                                        required={accountType === 'Business'}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Workspace password</label>
                                    <div style={{ position: 'relative', width: '100%' }}>
                                        <input
                                            type={showPass3 ? 'text' : 'password'}
                                            placeholder="4-8 digit PIN"
                                            style={{ ...inputStyle, paddingRight: '50px' }}
                                            value={workspacePin}
                                            onChange={(e) => setWorkspacePin(e.target.value)}
                                            required={accountType === 'Business'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass3(!showPass3)}
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
                                            {showPass3 ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit and Sign up */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '300px', alignSelf: 'center', fontFamily: DeFont }}>
                        <button type="submit" style={{
                            width: '100%', height: '40px', borderRadius: '14px', border: 'none',
                            background: orangeGradient, color: 'white', fontSize: '16px', fontWeight: '700',
                            cursor: 'pointer', boxShadow: '0px 4px 10px rgba(245, 130, 13, 0.2)', fontFamily: DeFont
                        }}>
                            Sign Up
                        </button>

                        <div style={{ fontSize: '12px', color: '#555' }}>
                            Already have an account?{' '}
                            <span
                                onClick={() => navigate('/signin')}
                                style={{ color: '#e2480b', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Sign in
                            </span>
                        </div>
                    </div>
                </div>
            </form>

        </div>
    );
};


// Reusable standard styling object for inputs to keep things clean
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