import { useState } from 'react';
import { cvApi } from '../network/cvApi.js';
import {
  buildNoCvProfile,
  normalizeCvProfile,
  normalizeIntake,
  validateCvFile,
  withIntake,
} from '../business/cvService.js';
import { saveCvProfile, saveLearnerName } from '../business/workflowService.js';

export function useCvUploadPresenter(onSuccess) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function upload(file, consentGiven, intake) {
    setError('');
    try {
      // Check the student's own details before reading the file: failing after a 10 MB upload
      // because a name box was empty is a waste of their time and their data allowance.
      const details = normalizeIntake(intake);
      validateCvFile(file);
      if (!consentGiven) {
        throw new Error('Please review and accept the CV processing notice before uploading.');
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      const signature = new TextDecoder().decode(bytes.subarray(0, 5));
      if (signature !== '%PDF-') {
        throw new Error('This file does not appear to be a valid PDF.');
      }
      setStatus('uploading');
      let binary = '';
      const chunkSize = 0x8000;
      for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
      }
      const base64 = btoa(binary);
      const payload = await cvApi.parsePdf(file.name, base64);
      const profile = withIntake(normalizeCvProfile(payload), details);
      saveLearnerName(details.name);
      saveCvProfile(profile);
      setStatus('complete');
      onSuccess(profile);
    } catch (uploadError) {
      setError(uploadError.message);
      setStatus('error');
    }
  }

  // Students start without a CV: nothing is uploaded and nothing is sent to Gemini here.
  function start(intake) {
    setError('');
    try {
      const details = normalizeIntake(intake);
      const profile = buildNoCvProfile(details);
      saveLearnerName(details.name);
      saveCvProfile(profile);
      setStatus('complete');
      onSuccess(profile);
    } catch (skipError) {
      setError(skipError.message);
      setStatus('error');
    }
  }

  return { error, status, upload, start };
}
