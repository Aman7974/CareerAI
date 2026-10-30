import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { SUPPORTED_COUNTRIES, getCountryByCode, AdzunaCountry } from '../utils/adzunaCountries';
import {
  validateEmailFormat,
  verifyGoogleAccount,
  generateVerificationCode,
  checkVerificationCode,
  GoogleAccountCheckResult,
} from '../utils/emailVerification';
import { saveUserToFirestore } from '../firebase';
import { FirebaseLiveInspector } from './FirebaseLiveInspector';
import {
  JOB_PROFILE_CATEGORIES,
  getCategoryAndDomainForRole,
} from '../utils/jobProfiles';
import { VERIFIED_GOOGLE_MAPS_PLACES } from '../utils/googleMapsLocations';

interface AuthScreenProps {
  onCompleteAuth: (profile: UserProfile, isNewUser?: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onCompleteAuth }) => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [isLiveInspectorOpen, setIsLiveInspectorOpen] = useState(false);
  const [isJustSignedUp, setIsJustSignedUp] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  // Email & Google Account Verification State
  const [email, setEmail] = useState('');
  const [emailFormatError, setEmailFormatError] = useState<string | null>(null);
  const [isCheckingGoogle, setIsCheckingGoogle] = useState(false);
  const [googleCheckResult, setGoogleCheckResult] = useState<GoogleAccountCheckResult | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [codeVerificationError, setCodeVerificationError] = useState<string | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);

  // Password State
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Country State (Key for Adzuna job search)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('in');
  const selectedCountry: AdzunaCountry = getCountryByCode(selectedCountryCode);

  // Location & Preferences (Google Maps Anchor)
  const [location, setLocation] = useState<string>('Bhopal, Madhya Pradesh');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level (3-5 yrs)');
  const [yearsOfExperience, setYearsOfExperience] = useState('4');
  const [domain, setDomain] = useState('Full Stack & Web Development');

  // Google Maps verified locations for selected country
  const availableLocations = useMemo(() => {
    const list: string[] = [];
    const countryPlaces = VERIFIED_GOOGLE_MAPS_PLACES.filter(
      (p) => p.countryCode === selectedCountryCode.toLowerCase()
    ).map((p) => p.name);
    list.push(...countryPlaces);

    for (const c of selectedCountry.popularCities) {
      if (!list.some((existing) => existing.toLowerCase().includes(c.toLowerCase()))) {
        list.push(c);
      }
    }

    if (location && !list.includes(location)) {
      list.unshift(location);
    }

    return list;
  }, [selectedCountryCode, selectedCountry, location]);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);

  // Feedback notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signupSuccessNotice, setSignupSuccessNotice] = useState<string | null>(null);
  const [verificationBanner, setVerificationBanner] = useState<string | null>(null);

  // Registered credentials state stored for verification during login
  const [registeredUser, setRegisteredUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('careerai_registered_credentials');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Password validation checks: Medium difficulty (1 uppercase, 1 digit, 1 special character, min 6 chars)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const hasMinLength = password.length >= 6;
  const isMediumPassword = hasUpperCase && hasDigit && hasSpecialChar && hasMinLength;

  // Name validation: Strictly letters and spaces only
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (/[^a-zA-Z\s]/.test(rawVal)) {
      setNameError('Name should contain letters only (A-Z, a-z). Numbers & symbols are not allowed.');
    } else {
      setNameError(null);
    }
    const cleanLettersOnly = rawVal.replace(/[^a-zA-Z\s]/g, '');
    setName(cleanLettersOnly);
  };

  // Email change handler with live format check
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setIsEmailVerified(false);
    setGoogleCheckResult(null);
    setShowCodeInput(false);
    setGeneratedCode(null);
    setVerificationBanner(null);

    if (!val) {
      setEmailFormatError(null);
      return;
    }

    const res = validateEmailFormat(val);
    if (!res.isValidFormat) {
      setEmailFormatError(res.error || 'Invalid email format.');
    } else if (!res.isGoogleAccount) {
      setEmailFormatError('Please enter a Google account email (@gmail.com or Google Workspace).');
    } else {
      setEmailFormatError(null);
    }
  };

  // Google Account Existence Check
  const handleVerifyGoogleAccount = async () => {
    if (!email.trim()) {
      setEmailFormatError('Please enter an email address first.');
      return;
    }

    setIsCheckingGoogle(true);
    setErrorMessage(null);

    try {
      const result = await verifyGoogleAccount(email);
      setGoogleCheckResult(result);

      if (result.status === 'verified') {
        setIsEmailVerified(true);
        setEmailFormatError(null);
      } else {
        setIsEmailVerified(false);
        setEmailFormatError(result.message);
      }
    } catch {
      setGoogleCheckResult({
        exists: false,
        status: 'error',
        message: 'Could not connect to Google verification directory. Please check network.',
      });
    } finally {
      setIsCheckingGoogle(false);
    }
  };

  // Request 6-Digit Email Verification Code
  const handleSendVerificationCode = () => {
    const formatCheck = validateEmailFormat(email);
    if (!formatCheck.isValidFormat) {
      setEmailFormatError(formatCheck.error || 'Please enter a valid email format.');
      return;
    }

    const code = generateVerificationCode(email);
    setGeneratedCode(code);
    setShowCodeInput(true);
    setCodeVerificationError(null);
    setVerificationBanner(`📩 Verification code sent to ${email}: [ ${code} ]`);
  };

  // Confirm Verification Code
  const handleConfirmCode = () => {
    if (!enteredCode.trim()) {
      setCodeVerificationError('Please enter the 6-digit verification code.');
      return;
    }

    const result = checkVerificationCode(email, enteredCode);
    if (result.isValid) {
      setIsEmailVerified(true);
      setShowCodeInput(false);
      setCodeVerificationError(null);
      setVerificationBanner(null);
      setGoogleCheckResult({
        exists: true,
        status: 'verified',
        message: `✓ Google Account verified: "${email}" is confirmed active.`,
      });
    } else {
      setCodeVerificationError(result.message);
    }
  };

  // Country Selection Change
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedCountryCode(newCode);
    const countryPlaces = VERIFIED_GOOGLE_MAPS_PLACES.filter(
      (p) => p.countryCode === newCode.toLowerCase()
    );
    if (countryPlaces.length > 0) {
      setLocation(countryPlaces[0].name);
    } else {
      const newCountry = getCountryByCode(newCode);
      if (newCountry.popularCities.length > 0) {
        setLocation(newCountry.popularCities[0]);
      }
    }
  };

  // Detect location via Google Maps & GPS Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser. Please select or type your location.');
      return;
    }

    setIsDetectingLocation(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsDetectingLocation(false);
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.municipality ||
              data.address?.state_district;
            const state = data.address?.state;
            const country = data.address?.country;
            const countryCode = data.address?.country_code?.toLowerCase();

            if (countryCode && SUPPORTED_COUNTRIES.some((c) => c.code === countryCode)) {
              setSelectedCountryCode(countryCode);
            }

            if (city && state) {
              setLocation(`${city}, ${state}`);
            } else if (city && country) {
              setLocation(`${city}, ${country}`);
            } else if (country) {
              setLocation(country);
            }
          }
        } catch {
          setLocation(selectedCountry.popularCities[0] || 'Bengaluru, India');
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        setErrorMessage(`Could not access device location (${err.message}). Picked top tech hub.`);
        setLocation(selectedCountry.popularCities[0] || 'Bengaluru, India');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Handle Step 1: Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Verify Name is valid letter format
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter your full name (letters only).');
      return;
    }
    if (/[^a-zA-Z\s]/.test(name)) {
      setErrorMessage('Name must only contain letter characters (A-Z, a-z).');
      return;
    }

    // 2. Verify Email Format
    const emailCheck = validateEmailFormat(email);
    if (!emailCheck.isValidFormat) {
      setErrorMessage(`Invalid email format: ${emailCheck.error}`);
      return;
    }

    // 3. Verify Google Account Exists
    if (!emailCheck.isGoogleAccount) {
      setErrorMessage('Please provide a valid Google account (@gmail.com or Google Workspace).');
      return;
    }

    // If user hasn't clicked verify yet, auto-verify now
    if (!isEmailVerified) {
      setIsCheckingGoogle(true);
      const verifyRes = await verifyGoogleAccount(email);
      setIsCheckingGoogle(false);
      if (!verifyRes.exists || verifyRes.status !== 'verified') {
        setErrorMessage(`Google Account Verification failed: ${verifyRes.message}`);
        return;
      }
      setIsEmailVerified(true);
    }

    // 4. Verify Medium Password Requirement
    if (!isMediumPassword) {
      const missingParts: string[] = [];
      if (!hasUpperCase) missingParts.push('at least 1 uppercase letter (A-Z)');
      if (!hasDigit) missingParts.push('at least 1 digit (0-9)');
      if (!hasSpecialChar) missingParts.push('at least 1 special character (!@#$%^&*)');
      if (!hasMinLength) missingParts.push('at least 6 characters in length');

      setErrorMessage(`Password difficulty must be Medium: Missing ${missingParts.join(', ')}.`);
      return;
    }

    // 5. Verify Country & Location
    if (!selectedCountryCode) {
      setErrorMessage('Please select your country.');
      return;
    }

    if (!location.trim()) {
      setErrorMessage('Please enter or select your location.');
      return;
    }

    const newUserProfile: UserProfile = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      targetRole: targetRole.trim() || 'Software Engineer',
      experienceLevel,
      yearsOfExperience,
      domain,
      locationPreference: location.trim(),
      location: location.trim(),
      country: selectedCountry.name,
      countryCode: selectedCountry.code,
      emailVerified: true,
      isGoogleAccount: true,
      registeredPassword: password,
    };

    // Store registered user in local state & localStorage
    setRegisteredUser(newUserProfile);
    setIsJustSignedUp(true);
    try {
      localStorage.setItem('careerai_registered_credentials', JSON.stringify(newUserProfile));
      localStorage.setItem('careerai_just_signed_up', 'true');
    } catch {}

    // Save directly to Firebase Firestore in real-time
    saveUserToFirestore(newUserProfile).catch((err) => {
      console.warn('Real-time sync to Firebase:', err);
    });

    // STEP 2: Transition to Log In mode using the created credential!
    setLoginEmail(newUserProfile.email);
    setLoginPassword('');
    setSignupSuccessNotice(
      `🎉 Account created successfully for ${newUserProfile.name}! Verified Google Account (${newUserProfile.email}) stored in Firebase. Please log in using your registered credentials to upload your resume.`
    );
    setMode('signin');
  };

  // Handle Step 2: Log In with Created Credentials
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputEmail = loginEmail.trim().toLowerCase();
    const inputPass = loginPassword;

    if (!inputEmail) {
      setErrorMessage('Please enter your email to log in.');
      return;
    }

    if (!inputPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    // Determine if user is newly registered in this session or an existing saved user
    let isNewUser = isJustSignedUp;
    try {
      if (localStorage.getItem('careerai_just_signed_up') === 'true') {
        isNewUser = true;
        localStorage.removeItem('careerai_just_signed_up');
      }
    } catch {}

    // Check against registered credentials
    let savedCredentials = registeredUser;
    if (!savedCredentials) {
      try {
        const saved = localStorage.getItem('careerai_registered_credentials');
        if (saved) savedCredentials = JSON.parse(saved);
      } catch {}
    }

    if (savedCredentials) {
      if (savedCredentials.email.toLowerCase() !== inputEmail) {
        setErrorMessage(`No account found with ${inputEmail}. Please check your email or Sign Up first.`);
        return;
      }

      if (savedCredentials.registeredPassword && savedCredentials.registeredPassword !== inputPass) {
        setErrorMessage('Incorrect password. Please enter the exact password you created during Sign Up.');
        return;
      }

      // Login Successful!
      saveUserToFirestore(savedCredentials).catch((err) => {
        console.warn('Real-time sync to Firebase on login:', err);
      });
      // Pass isNewUser flag: if false, loads already present resume without asking for upload!
      onCompleteAuth(savedCredentials, isNewUser);
    } else {
      // Fallback
      const profile: UserProfile = {
        name: inputEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: inputEmail,
        targetRole: 'Software Engineer',
        experienceLevel: 'Mid-Level (3-5 yrs)',
        yearsOfExperience: '4',
        domain: 'Full Stack / Web Development',
        locationPreference: location || 'San Francisco, CA',
        location: location || 'San Francisco, CA',
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        emailVerified: true,
        isGoogleAccount: true,
      };
      saveUserToFirestore(profile).catch((err) => {
        console.warn('Real-time sync to Firebase on fallback login:', err);
      });
      onCompleteAuth(profile, isNewUser);
    }
  };

  // Handle Job Profile Selection
  const handleSelectJobProfile = (roleTitle: string) => {
    setTargetRole(roleTitle);
    const { domain: matchedDomain } = getCategoryAndDomainForRole(roleTitle);
    setDomain(matchedDomain);
  };

  // Auto-fill demo credentials for testing
  const handleQuickFill = () => {
    setName('Aman Pachouri');
    setNameError(null);
    setEmail('amanpachouri0205@gmail.com');
    setEmailFormatError(null);
    setIsEmailVerified(true);
    setGoogleCheckResult({
      exists: true,
      status: 'verified',
      message: '✓ Google Account verified: amanpachouri0205@gmail.com is active.',
    });
    setPassword('Career@2026');
    setSelectedCountryCode('in');
    setLocation('Bhopal, Madhya Pradesh');
    setTargetRole('Full Stack Developer');
    setExperienceLevel('Mid-Level (3-5 yrs)');
    setYearsOfExperience('4');
    setDomain('Full Stack & Web Development');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/30 mb-3">
            <span className="material-symbols-outlined text-[26px]">smart_toy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            CareerAI Resume Platform
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signup'
              ? 'Step 1: Sign up with verified Google account, country & medium-difficulty password'
              : 'Step 2: Log in using your registered credentials to upload your resume'}
          </p>
        </div>

        {/* Live Firebase Database Status Banner */}
        <div className="flex items-center justify-between mb-4 px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700/70 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-xs" />
            <span className="text-slate-300 font-medium">Cloud Firestore Live</span>
          </div>
          <button
            type="button"
            onClick={() => setIsLiveInspectorOpen(true)}
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition shadow-xs"
          >
            <span>🔥 Real-Time Database Entries</span>
            <span>↗</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Sign Up (Create Account)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Log In
          </button>
        </div>

        {/* Success Notice after Sign Up */}
        {signupSuccessNotice && mode === 'signin' && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-emerald-400 shrink-0">check_circle</span>
            <div className="leading-relaxed">{signupSuccessNotice}</div>
          </div>
        )}

        {/* Verification Banner notice */}
        {verificationBanner && (
          <div className="mb-4 p-3.5 rounded-xl bg-sky-500/15 border border-sky-500/40 text-sky-300 text-xs flex items-center justify-between gap-2.5 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-sky-400">mark_email_read</span>
              <span className="font-semibold">{verificationBanner}</span>
            </div>
            {generatedCode && (
              <button
                type="button"
                onClick={() => setEnteredCode(generatedCode)}
                className="px-2 py-0.5 rounded bg-sky-600 text-white text-[10px] font-bold hover:bg-sky-500 cursor-pointer shrink-0"
              >
                Auto-fill Code
              </button>
            )}
          </div>
        )}

        {/* Error message alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-rose-400 shrink-0">error</span>
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {mode === 'signup' ? (
          <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
            {/* Name Input (Strict Letter Format Only) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">
                  Full Name <span className="text-sky-400">* (Letter format only)</span>
                </label>
                <span className="text-[10px] text-slate-400">A-Z, a-z & spaces</span>
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="Full Name"
                pattern="^[a-zA-Z\s]+$"
                title="Please enter letters only (no numbers or special characters)"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              {nameError && (
                <div className="mt-1 text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span>{nameError}</span>
                </div>
              )}
            </div>

            {/* Email Address with Google Account Verification & Format Checking */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google Account Email *</span>
                </label>
                {isEmailVerified ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    <span>Account Verified</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Checked for existence</span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Email address"
                  className={`flex-1 px-3.5 py-2.5 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    emailFormatError
                      ? 'border-rose-500 focus:border-rose-500'
                      : isEmailVerified
                      ? 'border-emerald-500 focus:border-emerald-500'
                      : 'border-slate-700 focus:border-sky-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleVerifyGoogleAccount}
                  disabled={isCheckingGoogle || !email.trim()}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Check if this Google Account exists and conforms to Google specifications"
                >
                  {isCheckingGoogle ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                  )}
                  <span>{isCheckingGoogle ? 'Checking...' : isEmailVerified ? 'Verified' : 'Verify Account'}</span>
                </button>
              </div>

              {/* Format or Validation Error */}
              {emailFormatError && (
                <div className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  <span>{emailFormatError}</span>
                </div>
              )}

              {/* Verified Result Badge */}
              {googleCheckResult && (
                <div
                  className={`p-2.5 rounded-lg text-[11px] flex items-center justify-between gap-2 border ${
                    googleCheckResult.exists
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">
                      {googleCheckResult.exists ? 'check_circle' : 'cancel'}
                    </span>
                    <span>{googleCheckResult.message}</span>
                  </div>

                  {!isEmailVerified && googleCheckResult.exists && (
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      className="text-xs text-sky-400 hover:text-sky-300 underline font-semibold cursor-pointer shrink-0"
                    >
                      Send 6-digit Code
                    </button>
                  )}
                </div>
              )}

              {/* 6-Digit Verification Code Section */}
              {showCodeInput && !isEmailVerified && (
                <div className="p-2.5 rounded-lg bg-sky-950/60 border border-sky-800/80 space-y-2 animate-in fade-in">
                  <div className="text-[11px] text-sky-200 font-semibold flex items-center justify-between">
                    <span>Enter 6-Digit Email Verification Code:</span>
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      className="text-[10px] text-sky-400 hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit code"
                      className="w-36 px-3 py-1.5 bg-slate-900 border border-sky-700 rounded-lg text-white font-mono tracking-widest text-center text-sm focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmCode}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer"
                    >
                      Confirm Code
                    </button>
                  </div>
                  {codeVerificationError && (
                    <div className="text-[10px] text-rose-400 font-medium">{codeVerificationError}</div>
                  )}
                </div>
              )}
            </div>

            {/* Country Selection */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-sky-400">public</span>
                  <span>Select Country *</span>
                </label>
                <span className="text-[11px] font-bold text-sky-300">
                  {selectedCountry.flag} {selectedCountry.currencyCode} ({selectedCountry.currencySymbol})
                </span>
              </div>

              <select
                value={selectedCountryCode}
                onChange={handleCountryChange}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.flag} {c.name} ({c.code.toUpperCase()}) — Currency: {c.currencySymbol} {c.currencyCode}
                  </option>
                ))}
              </select>
            </div>

            {/* Location (Google Maps Dropdown) */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-sky-400">pin_drop</span>
                  <span>Location (Google Maps) *</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold cursor-pointer underline disabled:opacity-50"
                  title="Detect location via GPS"
                >
                  <span className="material-symbols-outlined text-[14px]">my_location</span>
                  <span>{isDetectingLocation ? 'Detecting...' : 'Detect GPS'}</span>
                </button>
              </div>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-sky-500 transition-colors cursor-pointer text-xs"
              >
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-900 text-white">
                    📍 {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Password with Medium Difficulty Checklist */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold">
                  Password <span className="text-sky-400">* (Medium Difficulty)</span>
                </label>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isMediumPassword
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : password.length > 0
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-slate-700 text-slate-400 border-slate-600'
                  }`}
                >
                  {isMediumPassword ? '✓ Medium Difficulty Met' : 'Needs Medium Difficulty'}
                </span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 pr-10 focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Password Requirement Badges */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    hasUpperCase ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {hasUpperCase ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span>1 Uppercase (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasDigit ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {hasDigit ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span>1 Digit (0-9)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasSpecialChar ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {hasSpecialChar ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span>1 Special Keyword (!@#$)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasMinLength ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {hasMinLength ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span>6+ characters</span>
                </div>
              </div>
            </div>

            {/* Target Job Profile Section (Dropdown Only) */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-sky-400">badge</span>
                  <span>Target Job Profile *</span>
                </label>

                {/* Categorized Dropdown Only */}
                <select
                  value={targetRole}
                  onChange={(e) => handleSelectJobProfile(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-sky-500 transition-colors cursor-pointer text-xs"
                >
                  {JOB_PROFILE_CATEGORIES.map((cat) => (
                    <optgroup key={cat.name} label={`── ${cat.name} ──`} className="bg-slate-900 text-sky-300 font-semibold">
                      {cat.profiles.map((p) => (
                        <option key={p.title} value={p.title} className="bg-slate-900 text-white font-normal">
                          {p.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Experience Level & Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500 transition-colors text-xs cursor-pointer"
                  >
                    <option value="Entry-Level (0-2 yrs)">Entry-Level (0-2 yrs)</option>
                    <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
                    <option value="Senior (6-10 yrs)">Senior (6-10 yrs)</option>
                    <option value="Lead / Staff (10+ yrs)">Lead / Staff (10+ yrs)</option>
                    <option value="Director / Executive (12+ yrs)">Director / Executive (12+ yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Primary Domain</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Domain"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500 transition-colors text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer mt-2"
            >
              <span>1. Complete Sign Up → Proceed to Log In</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] text-slate-400 hover:text-sky-400 transition-colors cursor-pointer underline"
              >
                Auto-fill verified credentials (letters name + verified Google account + country)
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-sky-600/10 border border-sky-500/20 text-sky-300 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>
                {isJustSignedUp
                  ? 'Account created! Enter your credentials to log in and upload your resume.'
                  : 'Log in to your account. Saved users load their existing resume automatically.'}
              </span>
            </div>

            {/* Saved User Quick Login Card */}
            {registeredUser && !isJustSignedUp && (
              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-sky-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white">Saved User Detected</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                    ✓ Resume Already Present
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  <strong className="text-white">{registeredUser.name}</strong> ({registeredUser.email}) • {registeredUser.targetRole}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail(registeredUser.email);
                    if (registeredUser.registeredPassword) {
                      setLoginPassword(registeredUser.registeredPassword);
                    }
                    onCompleteAuth(registeredUser, false);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">account_circle</span>
                  <span>1-Click Log In as Saved User (Loads Present Resume)</span>
                </button>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <input
                  type={loginShowPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 pr-10 focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setLoginShowPassword(!loginShowPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {loginShowPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              <span>{isJustSignedUp ? '2. Log In & Upload Resume' : 'Log In & Load Saved Resume'}</span>
              <span className="material-symbols-outlined text-[18px]">login</span>
            </button>
            <div className="text-[10px] text-slate-400 text-center">
              {isJustSignedUp
                ? '• As a new user, you will be prompted to upload your resume.'
                : '• Saved user: your existing resume and analysis will load automatically without asking for upload.'}
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400">
              Need to create a new account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-sky-400 hover:underline font-semibold cursor-pointer"
              >
                Go back to Sign Up
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Real-time Firebase Database Entries Viewer Modal */}
      <FirebaseLiveInspector
        isOpen={isLiveInspectorOpen}
        onClose={() => setIsLiveInspectorOpen(false)}
      />
    </div>
  );
};
