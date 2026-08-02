import bg from '../assets/Signinupbg.png'
import layoutbg from '../assets/signinuplayoutbg.png'
import bg2 from '../assets/Signinupbg2.png'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SignUp() {
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState('Business'); // 'Personal' or 'Business'
    const [role, setRole] = useState('Manager'); // 'Manager' or 'Member'
    const [showPass1, setShowPass1] = useState(false);
    const [showPass2, setShowPass2] = useState(false);
    const [showPass3, setShowPass3] = useState(false);

    // Form inputs state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    // Business-only fields
    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaceId, setWorkspaceId] = useState('');
    const [workspacePin, setWorkspacePin] = useState('');

    // Email verification state (Option A: Progressive Step Verification)
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [pinCode, setPinCode] = useState('');
    const [pinError, setPinError] = useState('');
    const [pinSuccess, setPinSuccess] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifyingPin, setIsVerifyingPin] = useState(false);

    // Common styling constants
    const orangeGradient = 'linear-gradient(90deg, #F5820D 0%, #FA4A06 100%)';
    const lightBg = '#F6EFEA';
    const textGray = '#A09893';
    const DeFont = 'Satoshi';

    // Timer effect for OTP resend countdown
    useEffect(() => {
        let interval = null;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Step 1: Send OTP / Verification PIN to email
    const handleSendCode = (e) => {
        if (e) e.preventDefault();
        setPinError('');
        setPinSuccess('');

        if (!email || !email.includes('@') || !email.includes('.')) {
            setPinError('Please enter a valid email address.');
            return;
        }

        setIsSendingCode(true);
        // Simulate sending verification code via API
        setTimeout(() => {
            setIsSendingCode(false);
            setCodeSent(true);
            setResendTimer(60);
            setPinSuccess(`Verification PIN sent to ${email}! (Demo PIN: 123456)`);
        }, 800);
    };

    // Step 1: Verify entered PIN
    const handleVerifyPin = (e) => {
        if (e) e.preventDefault();
        setPinError('');
        setPinSuccess('');

        if (!pinCode || pinCode.trim().length < 4) {
            setPinError('Please enter a valid verification PIN.');
            return;
        }

        setIsVerifyingPin(true);
        // Simulate PIN verification check (accepts 123456 or any 6-digit code)
        setTimeout(() => {
            setIsVerifyingPin(false);
            if (pinCode.trim() === '123456' || pinCode.trim().length === 6) {
                setIsEmailVerified(true);
                setPinSuccess('Email verified successfully!');
            } else {
                setPinError('Invalid verification code. Please check your email or try 123456.');
            }
        }, 600);
    };

    // Reset email verification to change email
    const handleResetEmail = () => {
        setIsEmailVerified(false);
        setCodeSent(false);
        setPinCode('');
        setPinError('');
        setPinSuccess('');
    };

    // Final registration submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isEmailVerified) {
            setError('Please verify your email address first.');
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        // Payload matching RegisterRequest
        const payload = {
            username: username,
            email: email,
            password: password,
            account_type: accountType === 'Personal' ? 'individual' : 'business',
        };

        if (accountType === 'Business') {
            payload.business_role = role.toLowerCase();
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

            toast.success('Registration successful! Redirecting to Sign In...');
            navigate('/signin');
        } catch (err) {
            toast.error(err.message);
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

            {/* Card Form */}
            <form onSubmit={isEmailVerified ? handleSubmit : (codeSent ? handleVerifyPin : handleSendCode)} style={{ display: 'contents' }}>
                <div style={{
                    width: 'auto',
                    minWidth: isEmailVerified ? '380px' : '360px',
                    height: 'auto',
                    boxSizing: 'border-box',
                    padding: isEmailVerified ? '45px 44px' : '40px 36px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    background: 'white',
                    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                    borderRadius: '30px',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontFamily: DeFont
                }}>

                    {/* Header Title */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#CC4D08', fontSize: '20px', fontFamily: DeFont, fontWeight: '700', wordWrap: 'break-word' }}>Omni Platforms</div>
                        <div style={{ color: '#666', fontSize: '13px', fontFamily: DeFont, fontWeight: '400', marginTop: '2px' }}>Your Personal Content Distributor</div>
                    </div>

                    {/* Step 1: Email Verification Phase */}
                    {!isEmailVerified ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '300px', alignSelf: 'center' }}>
                            <div style={{
                                background: '#FFF6F0',
                                border: '1px solid #FFD9C0',
                                borderRadius: '12px',
                                padding: '10px 14px',
                                textAlign: 'center',
                                fontSize: '13px',
                                color: '#CC4D08',
                                fontWeight: '600'
                            }}>
                                Step 1 of 2: Verify Your Email
                            </div>

                            {pinError && (
                                <div style={{ color: '#FA4A06', fontSize: '13px', textAlign: 'center', fontWeight: '600' }}>
                                    {pinError}
                                </div>
                            )}

                            {pinSuccess && (
                                <div style={{ color: '#16A34A', fontSize: '13px', textAlign: 'center', fontWeight: '600' }}>
                                    {pinSuccess}
                                </div>
                            )}

                            {/* Email Input */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Email Address</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="email"
                                        placeholder="Peter@example.com"
                                        style={{ ...inputStyle, flex: 1 }}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={codeSent && resendTimer > 0}
                                        required
                                    />
                                    {!codeSent && (
                                        <button
                                            type="button"
                                            onClick={handleSendCode}
                                            disabled={isSendingCode}
                                            style={{
                                                padding: '0 14px',
                                                height: '42px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: orangeGradient,
                                                color: 'white',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {isSendingCode ? 'Sending...' : 'Send Code'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* PIN Code Box */}
                            {codeSent && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    animation: 'fadeIn 0.3s ease-in-out'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Enter PIN Code</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="123456"
                                            style={{
                                                ...inputStyle,
                                                textAlign: 'center',
                                                letterSpacing: '6px',
                                                fontSize: '18px',
                                                fontWeight: '700'
                                            }}
                                            value={pinCode}
                                            onChange={(e) => setPinCode(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleVerifyPin}
                                        disabled={isVerifyingPin}
                                        style={{
                                            width: '100%',
                                            height: '42px',
                                            borderRadius: '14px',
                                            border: 'none',
                                            background: orangeGradient,
                                            color: 'white',
                                            fontSize: '15px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            boxShadow: '0px 4px 10px rgba(245, 130, 13, 0.2)'
                                        }}
                                    >
                                        {isVerifyingPin ? 'Verifying PIN...' : 'Verify & Continue'}
                                    </button>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                        <span>Didn't receive code?</span>
                                        {resendTimer > 0 ? (
                                            <span style={{ color: '#999', fontWeight: '500' }}>Resend in {resendTimer}s</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleSendCode}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#FA4A06',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    padding: 0
                                                }}
                                            >
                                                Resend Code
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div style={{ fontSize: '12px', color: '#555', textAlign: 'center', marginTop: '8px' }}>
                                Already have an account?{' '}
                                <span
                                    onClick={() => navigate('/signin')}
                                    style={{ color: '#e2480b', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Sign in
                                </span>
                            </div>
                        </div>
                    ) : (
                        /* Expanded Sign Up Details Phase */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s ease-in-out' }}>

                            {/* Verified Email Banner */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: '#F0FDF4',
                                border: '1px solid #BBF7D0',
                                borderRadius: '14px',
                                padding: '10px 16px',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: '#16A34A',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '11px',
                                        fontWeight: 'bold'
                                    }}>
                                        ✓
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#15803D' }}>
                                        {email}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleResetEmail}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#16A34A',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textDecoration: 'underline',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Edit Email
                                </button>
                            </div>

                            {error && (
                                <div style={{ color: '#FA4A06', fontSize: '14px', textAlign: 'center', fontWeight: '600' }}>
                                    {error}
                                </div>
                            )}

                            {/* Account Type Toggle */}
                            <div style={{ display: 'flex', gap: '16px', width: '300px', alignSelf: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => setAccountType('Personal')}
                                    style={{
                                        flex: 1, height: '40px', borderRadius: '12px', fontFamily: DeFont,
                                        border: accountType === 'Personal' ? 'none' : `1px solid ${textGray}`,
                                        background: accountType === 'Personal' ? orangeGradient : 'white',
                                        color: accountType === 'Personal' ? 'white' : '#333',
                                        fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    Personal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAccountType('Business')}
                                    style={{
                                        flex: 1, height: '40px', borderRadius: '12px', fontFamily: DeFont,
                                        border: accountType === 'Business' ? 'none' : `1px solid ${textGray}`,
                                        background: accountType === 'Business' ? orangeGradient : 'white',
                                        color: accountType === 'Business' ? 'white' : '#333',
                                        fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    Business
                                </button>
                            </div>

                            {/* Columns Layout */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: accountType === 'Business' ? '40px' : '0px',
                                alignItems: 'stretch',
                                transition: 'gap 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                {/* Left Column: User details */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '300px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: '68px' }}>
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

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: '68px' }}>
                                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Password</label>
                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <input
                                                type={showPass1 ? 'text' : 'password'}
                                                placeholder="Enter your password"
                                                style={{ ...inputStyle, paddingRight: '50px' }}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass1(!showPass1)}
                                                style={{
                                                    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                                    color: '#929292', fontSize: '12px', fontWeight: '700', fontFamily: DeFont
                                                }}
                                            >
                                                {showPass1 ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: '68px' }}>
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
                                                    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                                    color: '#929292', fontSize: '12px', fontWeight: '700', fontFamily: DeFont
                                                }}
                                            >
                                                {showPass2 ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Separator Line */}
                                <div style={{
                                    width: accountType === 'Business' ? '1px' : '0px',
                                    backgroundColor: '#000000',
                                    opacity: accountType === 'Business' ? 0.15 : 0,
                                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-in-out'
                                }}></div>

                                {/* Right Column: Business options */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: accountType === 'Business' ? '300px' : '0px',
                                    opacity: accountType === 'Business' ? 1 : 0,
                                    overflow: 'hidden',
                                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out',
                                    pointerEvents: accountType === 'Business' ? 'auto' : 'none'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '300px', minWidth: '300px' }}>
                                        {/* Role Selector */}
                                        <div style={{ display: 'flex', alignItems: 'flex-end', height: '68px' }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                width: '100%', height: '42px', boxSizing: 'border-box'
                                            }}>
                                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>You are?</span>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRole('Manager')}
                                                        style={{
                                                            height: '40px', borderRadius: '12px', fontFamily: DeFont, width: '100px',
                                                            background: role === 'Manager' ? orangeGradient : 'transparent',
                                                            color: role === 'Manager' ? 'white' : '#333',
                                                            border: role === 'Manager' ? 'none' : `1px solid ${textGray}`,
                                                            fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'center'
                                                        }}
                                                    >
                                                        Manager
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRole('Member')}
                                                        style={{
                                                            height: '40px', borderRadius: '12px', fontFamily: DeFont, width: '100px',
                                                            background: role === 'Member' ? orangeGradient : 'transparent',
                                                            color: role === 'Member' ? 'white' : '#333',
                                                            border: role === 'Member' ? 'none' : `1px solid ${textGray}`,
                                                            fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'center'
                                                        }}
                                                    >
                                                        Member
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Workspace Name / ID */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: '68px' }}>
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

                                        {/* Workspace Password */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: '68px' }}>
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
                                                        position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                                        border: 'none', background: 'transparent', cursor: 'pointer',
                                                        color: '#929292', fontSize: '12px', fontWeight: '700', fontFamily: DeFont
                                                    }}
                                                >
                                                    {showPass3 ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '300px', alignSelf: 'center' }}>
                                <button
                                    type="submit"
                                    style={{
                                        width: '100%', height: '42px', borderRadius: '14px', border: 'none',
                                        background: orangeGradient, color: 'white', fontSize: '16px', fontWeight: '700',
                                        cursor: 'pointer', boxShadow: '0px 4px 10px rgba(245, 130, 13, 0.2)', fontFamily: DeFont
                                    }}
                                >
                                    Complete Sign Up
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
                    )}
                </div>
            </form>
        </div>
    );
}

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
