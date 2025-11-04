/**
 * BaseInput Examples
 * 
 * Comprehensive showcase of all BaseInput variations and use cases
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React, { useState } from 'react';
import BaseInput from './BaseInput';

// ============================================================================
// SVG ICONS (No external dependencies)
// ============================================================================

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

// ============================================================================
// EXAMPLE COMPONENT
// ============================================================================

const BaseInputExamples: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [url, setUrl] = useState('');
  const [search, setSearch] = useState('');
  const [bio, setBio] = useState('');
  const [description, setDescription] = useState('');

  const handleClick = (message: string) => {
    alert(message);
  };

  return (
    <div className="p-8 space-y-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">BaseInput Examples</h1>

      {/* Basic Inputs */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Basic Inputs</h2>
        <div className="space-y-4">
          <BaseInput
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <BaseInput
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <BaseInput
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </section>

      {/* Input Sizes */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Input Sizes</h2>
        <div className="space-y-4">
          <BaseInput
            size="small"
            label="Small Input"
            placeholder="Small size input"
          />

          <BaseInput
            size="medium"
            label="Medium Input (Default)"
            placeholder="Medium size input"
          />

          <BaseInput
            size="large"
            label="Large Input"
            placeholder="Large size input"
          />
        </div>
      </section>

      {/* Validation States */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Validation States</h2>
        <div className="space-y-4">
          <BaseInput
            label="Default State"
            placeholder="Normal input"
            helperText="This is a helper text"
          />

          <BaseInput
            label="Success State"
            placeholder="Valid input"
            value="john@example.com"
            success="Email is valid!"
          />

          <BaseInput
            label="Error State"
            placeholder="Invalid input"
            value="invalid-email"
            error="Please enter a valid email address"
          />

          <BaseInput
            label="Warning State"
            placeholder="Warning input"
            state="warning"
            value="test@test.com"
            helperText="This email domain is not recommended"
          />
        </div>
      </section>

      {/* With Icons */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Inputs with Icons</h2>
        <div className="space-y-4">
          <BaseInput
            label="Username"
            placeholder="Enter username"
            startIcon={<UserIcon />}
          />

          <BaseInput
            type="email"
            label="Email"
            placeholder="Enter email"
            startIcon={<EmailIcon />}
            endIcon={email ? <CheckIcon /> : undefined}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <BaseInput
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Enter password"
            startIcon={<LockIcon />}
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <BaseInput
            type="search"
            label="Search"
            placeholder="Search..."
            startIcon={<SearchIcon />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Different Input Types */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Input Types</h2>
        <div className="space-y-4">
          <BaseInput
            type="text"
            label="Text Input"
            placeholder="Enter text"
          />

          <BaseInput
            type="email"
            label="Email Input"
            placeholder="email@example.com"
            startIcon={<EmailIcon />}
          />

          <BaseInput
            type="password"
            label="Password Input"
            placeholder="Enter password"
            startIcon={<LockIcon />}
          />

          <BaseInput
            type="number"
            label="Number Input"
            placeholder="Enter number"
            min={0}
            max={100}
          />

          <BaseInput
            type="tel"
            label="Phone Input"
            placeholder="+1 (555) 000-0000"
            startIcon={<PhoneIcon />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <BaseInput
            type="url"
            label="URL Input"
            placeholder="https://example.com"
            startIcon={<LinkIcon />}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <BaseInput
            type="search"
            label="Search Input"
            placeholder="Search..."
            startIcon={<SearchIcon />}
          />
        </div>
      </section>

      {/* Textarea/Multiline */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Textarea (Multiline)</h2>
        <div className="space-y-4">
          <BaseInput
            multiline
            label="Biography"
            placeholder="Tell us about yourself..."
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            helperText="Write a short bio (optional)"
          />

          <BaseInput
            multiline
            label="Description"
            placeholder="Enter description..."
            rows={3}
            maxLength={200}
            showCount
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </section>

      {/* Required Fields */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Required Fields</h2>
        <div className="space-y-4">
          <BaseInput
            label="Full Name"
            placeholder="Enter your full name"
            required
          />

          <BaseInput
            type="email"
            label="Email Address"
            placeholder="email@example.com"
            required
            startIcon={<EmailIcon />}
          />

          <BaseInput
            multiline
            label="Comments"
            placeholder="Your comments..."
            required
            rows={4}
          />
        </div>
      </section>

      {/* Character Count */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Character Count</h2>
        <div className="space-y-4">
          <BaseInput
            label="Tweet"
            placeholder="What's happening?"
            maxLength={280}
            showCount
          />

          <BaseInput
            multiline
            label="Short Description"
            placeholder="Enter a short description..."
            rows={3}
            maxLength={150}
            showCount
          />
        </div>
      </section>

      {/* Disabled State */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Disabled State</h2>
        <div className="space-y-4">
          <BaseInput
            label="Disabled Input"
            placeholder="Cannot edit this"
            disabled
          />

          <BaseInput
            label="Disabled with Value"
            value="This field is disabled"
            disabled
          />

          <BaseInput
            multiline
            label="Disabled Textarea"
            value="This textarea is disabled"
            disabled
            rows={3}
          />
        </div>
      </section>

      {/* Full Width */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Full Width</h2>
        <div className="space-y-4">
          <BaseInput
            label="Full Width Input"
            placeholder="This input takes full width"
            fullWidth
          />

          <div className="grid grid-cols-2 gap-4">
            <BaseInput
              label="Half Width"
              placeholder="50% width"
            />
            <BaseInput
              label="Half Width"
              placeholder="50% width"
            />
          </div>
        </div>
      </section>

      {/* Real-World Form Example */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Real-World: Registration Form</h2>
        <div className="space-y-4 bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">Create Account</h3>

          <BaseInput
            label="Full Name"
            placeholder="John Doe"
            required
            startIcon={<UserIcon />}
          />

          <BaseInput
            type="email"
            label="Email Address"
            placeholder="john@example.com"
            required
            startIcon={<EmailIcon />}
          />

          <BaseInput
            type="password"
            label="Password"
            placeholder="Enter password"
            required
            startIcon={<LockIcon />}
            helperText="Must be at least 8 characters"
          />

          <BaseInput
            type="tel"
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            startIcon={<PhoneIcon />}
          />

          <BaseInput
            multiline
            label="Bio"
            placeholder="Tell us about yourself (optional)"
            rows={4}
            maxLength={200}
            showCount
          />

          <button
            onClick={() => handleClick('Form submitted!')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Account
          </button>
        </div>
      </section>

      {/* Real-World: Login Form */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Real-World: Login Form</h2>
        <div className="space-y-4 bg-white p-6 rounded-lg border max-w-md">
          <h3 className="text-xl font-semibold mb-4">Sign In</h3>

          <BaseInput
            type="email"
            label="Email"
            placeholder="email@example.com"
            required
            fullWidth
            startIcon={<EmailIcon />}
          />

          <BaseInput
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
            fullWidth
            startIcon={<LockIcon />}
          />

          <button
            onClick={() => handleClick('Login successful!')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Real-World: Search Bar */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Real-World: Search Bar</h2>
        <div className="bg-white p-6 rounded-lg border">
          <BaseInput
            type="search"
            size="large"
            placeholder="Search for products, categories, or brands..."
            fullWidth
            startIcon={<SearchIcon />}
          />
        </div>
      </section>

      {/* Real-World: Contact Form */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Real-World: Contact Form</h2>
        <div className="space-y-4 bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>

          <div className="grid grid-cols-2 gap-4">
            <BaseInput
              label="First Name"
              placeholder="John"
              required
            />
            <BaseInput
              label="Last Name"
              placeholder="Doe"
              required
            />
          </div>

          <BaseInput
            type="email"
            label="Email"
            placeholder="john@example.com"
            required
            fullWidth
            startIcon={<EmailIcon />}
          />

          <BaseInput
            type="tel"
            label="Phone"
            placeholder="+1 (555) 000-0000"
            fullWidth
            startIcon={<PhoneIcon />}
          />

          <BaseInput
            multiline
            label="Message"
            placeholder="How can we help you?"
            required
            fullWidth
            rows={5}
            maxLength={500}
            showCount
          />

          <button
            onClick={() => handleClick('Message sent!')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send Message
          </button>
        </div>
      </section>
    </div>
  );
};

export default BaseInputExamples;
