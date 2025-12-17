import React, { useState } from 'react';

interface BackgroundQuestionsProps {
  onBackgroundSubmit: (backgroundData: {
    backgroundSoftware: string;
    backgroundHardware: string;
    backgroundDescription?: string;
  }) => void;
  onCancel: () => void;
}

const BackgroundQuestions: React.FC<BackgroundQuestionsProps> = ({
  onBackgroundSubmit,
  onCancel
}) => {
  const [backgroundSoftware, setBackgroundSoftware] = useState<string>('');
  const [backgroundHardware, setBackgroundHardware] = useState<string>('');
  const [backgroundDescription, setBackgroundDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onBackgroundSubmit({
      backgroundSoftware,
      backgroundHardware,
      backgroundDescription: backgroundDescription.trim() || undefined
    });
  };

  return (
    <div className="background-questions">
      <h3>Tell us about your background</h3>
      <p>We'll personalize your learning experience based on your experience level.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="backgroundSoftware">Software Experience:</label>
          <select
            id="backgroundSoftware"
            value={backgroundSoftware}
            onChange={(e) => setBackgroundSoftware(e.target.value)}
            required
          >
            <option value="">Select your software experience level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="backgroundHardware">Hardware Experience:</label>
          <select
            id="backgroundHardware"
            value={backgroundHardware}
            onChange={(e) => setBackgroundHardware(e.target.value)}
            required
          >
            <option value="">Select your hardware experience level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="backgroundDescription">Additional Background Information (Optional):</label>
          <textarea
            id="backgroundDescription"
            value={backgroundDescription}
            onChange={(e) => setBackgroundDescription(e.target.value)}
            placeholder="Tell us more about your technical background, interests, or goals..."
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Back
          </button>
          <button type="submit" className="btn btn-primary" disabled={!backgroundSoftware || !backgroundHardware}>
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default BackgroundQuestions;