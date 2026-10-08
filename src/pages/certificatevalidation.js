import React, { useState } from 'react';
import {
	BadgeCheck,
	CircleAlert,
	CircleCheck,
	CircleX,
	Fingerprint,
	LoaderCircle,
	Search,
	ShieldCheck,
	X,
} from 'lucide-react';
import { validateCertificate } from '../services/api';

const formatLabel = (value) =>
	value
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.replace(/\b\w/g, (character) => character.toUpperCase());

const formatValue = (key, value) => {
	if (value === null || value === undefined || value === '') return '—';
	if (typeof value === 'boolean') return value ? 'Yes' : 'No';
	if (Array.isArray(value)) return value.map(String).join(', ');
	if (typeof value === 'object') return JSON.stringify(value);

	if (/date|issued|expires/i.test(key)) {
		const date = new Date(value);
		if (!Number.isNaN(date.getTime())) {
			return date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});
		}
	}

	return String(value);
};

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
			<header className="flex items-start gap-4">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
					<ShieldCheck size={24} aria-hidden="true" />
				</div>
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
						Employer tools
					</p>
					<h2 className="mt-1 text-2xl font-bold text-slate-900">Certificate validation</h2>
					<p className="mt-1 max-w-2xl text-sm text-slate-600">
						Confirm a learner&apos;s certificate using its unique code.
					</p>
				</div>
			</header>

			<div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
				<section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="verify-title">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
							<Fingerprint size={19} aria-hidden="true" />
						</div>
						<div>
							<h3 id="verify-title" className="font-semibold text-slate-900">Verify a certificate</h3>
							<p className="text-xs text-slate-500">Certificate code lookup</p>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="mt-6 space-y-4">
						<div>
							<label htmlFor="certificate-code" className="mb-2 block text-sm font-medium text-slate-800">
								Certificate code
							</label>
							<div className="relative">
								<Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
								<input
									id="certificate-code"
									type="text"
									value={certificateCode}
									onChange={(event) => {
										setCertificateCode(event.target.value);
										setError('');
										setResult(null);
									}}
									placeholder="Enter certificate code"
									className="h-12 w-full rounded-md border border-slate-300 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:bg-slate-50"
									autoComplete="off"
									autoCapitalize="characters"
									spellCheck={false}
									disabled={isLoading}
								/>
								{certificateCode && !isLoading && (
									<button
										type="button"
										onClick={() => {
											setCertificateCode('');
											setError('');
											setResult(null);
										}}
										className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
										aria-label="Clear certificate code"
									>
										<X size={16} aria-hidden="true" />
									</button>
								)}
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-36"
						>
							{isLoading ? (
								<>
									<LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
									Verifying
								</>
							) : (
								<>
									<ShieldCheck size={17} aria-hidden="true" />
									Verify certificate
								</>
							)}
						</button>
					</form>

					{error && (
						<div className="mt-4 flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800" role="alert">
							<CircleAlert className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
							<span>{error}</span>
						</div>
					)}
				</section>

				<section className="min-h-64" aria-live="polite" aria-label="Certificate verification result">
					{result ? (
						<div className={`overflow-hidden rounded-lg border bg-white shadow-sm ${isValid ? 'border-emerald-200' : 'border-red-200'}`}>
							<div className={`flex items-start gap-3 border-b px-5 py-4 sm:px-6 ${isValid ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
								<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
									{isValid ? <CircleCheck size={22} aria-hidden="true" /> : <CircleX size={22} aria-hidden="true" />}
								</div>
								<div>
									<p className={`text-xs font-semibold uppercase tracking-wider ${isValid ? 'text-emerald-800' : 'text-red-800'}`}>
										{isValid ? 'Verified' : 'Not verified'}
									</p>
									<h3 className="mt-1 text-lg font-semibold text-slate-900">
										{isValid ? 'Certificate is authentic' : 'Certificate could not be verified'}
									</h3>
								</div>
							</div>

							{isValid && certificate && typeof certificate === 'object' && Object.keys(certificate).length > 0 && (
								<dl className="grid gap-x-6 px-5 py-2 sm:grid-cols-2 sm:px-6">
									{Object.entries(certificate).map(([key, value]) => (
										<div key={key} className="min-w-0 border-b border-slate-100 py-3 last:border-0">
											<dt className="text-xs font-medium text-slate-500">{formatLabel(key)}</dt>
											<dd className="mt-1 break-words text-sm font-medium text-slate-900">{formatValue(key, value)}</dd>
										</div>
									))}
								</dl>
							)}
						</div>
					) : (
						<div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
								<BadgeCheck size={22} aria-hidden="true" />
							</div>
							<h3 className="mt-4 text-sm font-semibold text-slate-800">No verification yet</h3>
							<p className="mt-1 max-w-xs text-sm text-slate-500">
								A certificate&apos;s verification details will appear here.
							</p>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
