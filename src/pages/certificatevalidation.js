import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { validateCertificate } from '../services/api';

export default function CertificateValidation() {
	const [certificateCode, setCertificateCode] = useState('');
	const [result, setResult] = useState(null);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		const code = certificateCode.trim();

		if (!code) {
			setError('Enter a certificate code to verify.');
			setResult(null);
			return;
		}

		setIsLoading(true);
		setError('');
		setResult(null);

		try {
			const response = await validateCertificate(code);
			setResult(response);
		} catch (requestError) {
			setError(
				requestError.response?.data?.message ||
					'Certificate could not be verified. Check the code and try again.'
			);
		} finally {
			setIsLoading(false);
		}
	};

	const isValid = result && (result.valid ?? result.isValid ?? result.success ?? true);
	const certificate = result?.certificate || result?.data || result;

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-slate-900">Certificate Validation</h2>
				<p className="text-sm text-slate-500 mt-1">
					Verify the authenticity of a learner&apos;s certificate.
				</p>
			</div>

			<Card className="max-w-2xl">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="certificate-code" className="block text-sm font-medium text-slate-700 mb-1">
							Certificate code
						</label>
						<input
							id="certificate-code"
							type="text"
							value={certificateCode}
							onChange={(event) => setCertificateCode(event.target.value)}
							placeholder="Enter certificate code"
							className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100"
							disabled={isLoading}
						/>
					</div>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? 'Verifying...' : 'Verify'}
					</Button>
				</form>
			</Card>

			{error && (
				<div className="max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
					{error}
				</div>
			)}

			{result && (
				<Card className={`max-w-2xl border ${isValid ? 'border-brand-green-200' : 'border-red-200'}`}>
					<h3 className={`text-lg font-semibold ${isValid ? 'text-brand-green-700' : 'text-red-700'}`}>
						{isValid ? 'Certificate verified' : 'Certificate is not valid'}
					</h3>
					{isValid && certificate && typeof certificate === 'object' && (
						<dl className="mt-4 space-y-2 text-sm">
							{Object.entries(certificate).map(([key, value]) => (
								<div key={key} className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
									<dt className="font-medium capitalize text-slate-500">{key.replace(/_/g, ' ')}</dt>
									<dd className="text-right text-slate-800">{String(value)}</dd>
								</div>
							))}
						</dl>
					)}
				</Card>
			)}
		</div>
	);
}
