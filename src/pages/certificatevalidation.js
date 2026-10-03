import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { validateCertificate } from '../services/api';

import {
  Award,
  BadgeCheck,
  Check,
  CircleAlert,
  FileCheck2,
  KeyRound,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';

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

  const isValid =
    result &&
    (result.valid ??
      result.isValid ??
      result.success ??
      true);

  const certificate =
    result?.certificate ||
    result?.data ||
    result;

  return (
    <div className="relative space-y-7 pb-10">

      {/* =====================================================
          BACKGROUND LIGHTING
      ===================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div
          className="
            absolute
            top-10
            left-[8%]
            w-72
            h-72
            rounded-full
            bg-blue-500/[0.05]
            blur-[100px]
          "
        />

        <div
          className="
            absolute
            top-[30%]
            right-[8%]
            w-80
            h-80
            rounded-full
            bg-violet-500/[0.05]
            blur-[110px]
          "
        />

        <div
          className="
            absolute
            bottom-10
            left-[40%]
            w-64
            h-64
            rounded-full
            bg-cyan-500/[0.04]
            blur-[100px]
          "
        />

      </div>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3.5">

          <div
            className="
              relative
              w-12
              h-12
              rounded-2xl
              p-[1.5px]
              bg-gradient-to-br
              from-blue-500
              via-indigo-500
              to-violet-600
              shadow-[0_9px_28px_rgba(79,70,229,0.20)]
            "
          >
            <div
              className="
                w-full
                h-full
                rounded-[14px]
                bg-white
                dark:bg-slate-950
                text-blue-600
                dark:text-blue-400
                grid
                place-items-center
              "
            >
              <Award size={22} />
            </div>
          </div>

          <div>

            <div className="flex items-center gap-2">

              <h2
                className="
                  text-2xl
                  font-extrabold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                Certificate Validation
              </h2>

              <span
                className="
                  hidden
                  sm:inline-flex
                  items-center
                  gap-1
                  rounded-full
                  bg-gradient-to-r
                  from-blue-500/10
                  to-violet-500/10
                  px-2.5
                  py-1
                  text-[9px]
                  font-extrabold
                  uppercase
                  tracking-wider
                  text-blue-600
                  dark:text-blue-400
                  border
                  border-blue-500/10
                "
              >
                <Sparkles size={10} />
                Verification
              </span>

            </div>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Verify the authenticity of a learner&apos;s certificate.
            </p>

          </div>
        </div>

        <div
          className="
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-2xl
            border
            border-slate-200/70
            dark:border-slate-700/70
            bg-white/70
            dark:bg-slate-900/70
            backdrop-blur-xl
            px-3.5
            py-2.5
            text-xs
            font-bold
            text-slate-500
            dark:text-slate-400
            shadow-sm
          "
        >
          <ShieldCheck
            size={14}
            className="text-emerald-500"
          />
          Secure verification
        </div>

      </div>

      {/* =====================================================
          VERIFICATION CARD
      ===================================================== */}
      <Card className="max-w-3xl">

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-slate-200/70
            dark:border-slate-800
            bg-gradient-to-br
            from-blue-50/70
            via-white
            to-violet-50/60
            dark:from-blue-950/20
            dark:via-slate-950
            dark:to-violet-950/20
          "
        >

          {/* Decorative glow */}
          <div
            className="
              pointer-events-none
              absolute
              -top-24
              -right-20
              w-64
              h-64
              rounded-full
              bg-blue-500/10
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-28
              left-[30%]
              w-72
              h-72
              rounded-full
              bg-violet-500/10
              blur-3xl
            "
          />

          {/* Header */}
          <div
            className="
              relative
              flex
              flex-col
              gap-4
              border-b
              border-slate-200/70
              dark:border-slate-800
              px-5
              py-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-gradient-to-br
                  from-blue-500
                  to-indigo-600
                  text-white
                  grid
                  place-items-center
                  shadow-[0_7px_20px_rgba(79,70,229,0.22)]
                "
              >
                <FileCheck2 size={18} />
              </div>

              <div>

                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Verify a certificate
                </h3>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Enter the unique certificate code below.
                </p>

              </div>

            </div>

            <span
              className="
                inline-flex
                w-fit
                items-center
                gap-1.5
                rounded-full
                bg-emerald-500/10
                px-3
                py-1.5
                text-[10px]
                font-extrabold
                uppercase
                tracking-wider
                text-emerald-600
                dark:text-emerald-400
                border
                border-emerald-500/10
              "
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Ready
            </span>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="relative space-y-5 px-5 py-6 sm:px-6 sm:py-7"
          >

            <div>

              <label
                htmlFor="certificate-code"
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-extrabold
                  text-slate-800
                  dark:text-slate-100
                "
              >
                <KeyRound
                  size={15}
                  className="text-blue-500"
                />

                Certificate code
              </label>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Enter the unique code provided on the learner&apos;s certificate.
              </p>

              <div
                className="
                  mt-3
                  relative
                  p-[1px]
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-500/20
                  via-indigo-500/20
                  to-violet-500/20
                  focus-within:from-blue-500/60
                  focus-within:via-indigo-500/50
                  focus-within:to-violet-500/60
                  transition-all
                  duration-300
                "
              >

                <div className="relative">

                  <KeyRound
                    size={17}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      pointer-events-none
                    "
                  />

                  <input
                    id="certificate-code"
                    type="text"
                    value={certificateCode}
                    onChange={(event) => {
                      setCertificateCode(
                        event.target.value
                      );
                      setError('');
                      setResult(null);
                    }}
                    placeholder="Enter certificate code"
                    disabled={isLoading}
                    className="
                      w-full
                      rounded-[15px]
                      bg-white
                      dark:bg-slate-950
                      pl-10
                      pr-4
                      py-3.5
                      text-sm
                      font-medium
                      text-slate-900
                      dark:text-slate-100
                      placeholder-slate-400
                      dark:placeholder-slate-600
                      outline-none
                      disabled:bg-slate-100
                      dark:disabled:bg-slate-900
                    "
                  />

                </div>
              </div>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">

                <ShieldCheck size={13} />

                <span>
                  Certificate information is checked securely.
                </span>

              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="group w-full sm:w-auto"
              >

                <span className="flex items-center justify-center gap-2">

                  {isLoading ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />

                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search size={15} />

                      Verify Certificate
                    </>
                  )}

                </span>

              </Button>

            </div>

          </form>
        </div>

      </Card>

      {/* =====================================================
          ERROR
      ===================================================== */}
      {error && (
        <div
          className="
            max-w-3xl
            relative
            overflow-hidden
            rounded-2xl
            border
            border-red-200/70
            dark:border-red-500/20
            bg-gradient-to-r
            from-red-50
            to-rose-50
            dark:from-red-950/20
            dark:to-rose-950/10
            px-5
            py-4
            shadow-sm
          "
          role="alert"
        >

          <div className="flex items-start gap-3">

            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-red-500/10
                text-red-500
                grid
                place-items-center
                shrink-0
              "
            >
              <CircleAlert size={17} />
            </div>

            <div>

              <p className="text-xs font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">
                Verification failed
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
                {error}
              </p>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          RESULT
      ===================================================== */}
      {result && (
        <Card
          className={`
            max-w-3xl
            overflow-hidden
            border
            ${
              isValid
                ? `
                  border-emerald-200/70
                  dark:border-emerald-500/20
                `
                : `
                  border-red-200/70
                  dark:border-red-500/20
                `
            }
          `}
        >

          {/* Result header */}
          <div
            className={`
              relative
              overflow-hidden
              px-5
              py-6
              sm:px-6
              ${
                isValid
                  ? `
                    bg-gradient-to-br
                    from-emerald-50
                    via-teal-50/70
                    to-cyan-50/50
                    dark:from-emerald-950/20
                    dark:via-teal-950/10
                    dark:to-cyan-950/10
                  `
                  : `
                    bg-gradient-to-br
                    from-red-50
                    via-rose-50/70
                    to-orange-50/40
                    dark:from-red-950/20
                    dark:via-rose-950/10
                    dark:to-orange-950/10
                  `
              }
            `}
          >

            <div
              className={`
                pointer-events-none
                absolute
                -top-24
                -right-20
                w-60
                h-60
                rounded-full
                blur-3xl
                ${
                  isValid
                    ? "bg-emerald-400/10"
                    : "bg-red-400/10"
                }
              `}
            />

            <div className="relative flex items-center gap-4">

              <div
                className={`
                  w-14
                  h-14
                  rounded-2xl
                  grid
                  place-items-center
                  shrink-0
                  text-white
                  shadow-lg
                  ${
                    isValid
                      ? `
                        bg-gradient-to-br
                        from-emerald-500
                        to-teal-600
                        shadow-[0_9px_25px_rgba(16,185,129,0.25)]
                      `
                      : `
                        bg-gradient-to-br
                        from-red-500
                        to-rose-600
                        shadow-[0_9px_25px_rgba(239,68,68,0.22)]
                      `
                  }
                `}
              >
                {isValid ? (
                  <BadgeCheck
                    size={27}
                    strokeWidth={2.2}
                  />
                ) : (
                  <XCircle
                    size={27}
                    strokeWidth={2.2}
                  />
                )}
              </div>

              <div>

                <div
                  className={`
                    text-lg
                    font-extrabold
                    ${
                      isValid
                        ? "text-emerald-900 dark:text-emerald-300"
                        : "text-red-900 dark:text-red-300"
                    }
                  `}
                >
                  {isValid
                    ? 'Certificate verified'
                    : 'Certificate is not valid'}
                </div>

                <p
                  className={`
                    mt-1
                    text-sm
                    ${
                      isValid
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 dark:text-red-400"
                    }
                  `}
                >
                  {isValid
                    ? 'The certificate code was successfully verified.'
                    : 'The provided certificate could not be verified.'}
                </p>

              </div>

            </div>
          </div>

          {/* Certificate details */}
          {isValid &&
            certificate &&
            typeof certificate === 'object' && (
              <div className="p-5 sm:p-6">

                <div className="flex items-center gap-2 mb-4">

                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center">
                    <FileCheck2 size={15} />
                  </div>

                  <div>

                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Certificate Details
                    </h3>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Verified certificate information
                    </p>

                  </div>

                </div>

                <div
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    dark:border-slate-800
                  "
                >

                  <dl>

                    {Object.entries(certificate).map(
                      ([key, value], index) => (
                        <div
                          key={key}
                          className={`
                            grid
                            grid-cols-1
                            gap-2
                            px-4
                            py-4
                            sm:grid-cols-[180px_1fr]
                            sm:gap-6
                            ${
                              index <
                              Object.entries(
                                certificate
                              ).length -
                                1
                                ? "border-b border-slate-100 dark:border-slate-800"
                                : ""
                            }
                            hover:bg-slate-50/80
                            dark:hover:bg-slate-900/60
                            transition-colors
                          `}
                        >

                          <dt
                            className="
                              flex
                              items-center
                              gap-2
                              text-xs
                              font-bold
                              capitalize
                              text-slate-400
                              dark:text-slate-500
                            "
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />

                            {key.replace(
                              /_/g,
                              ' '
                            )}
                          </dt>

                          <dd
                            className="
                              break-words
                              text-sm
                              font-semibold
                              text-slate-800
                              dark:text-slate-200
                              sm:text-right
                            "
                          >
                            {String(value)}
                          </dd>

                        </div>
                      )
                    )}

                  </dl>

                </div>

                {/* Verified footer */}
                <div
                  className="
                    mt-4
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-emerald-500/[0.06]
                    dark:bg-emerald-500/[0.08]
                    px-3.5
                    py-3
                    text-xs
                    font-semibold
                    text-emerald-700
                    dark:text-emerald-400
                  "
                >
                  <Check
                    size={14}
                    className="shrink-0"
                  />

                  Certificate authenticity successfully confirmed.
                </div>

              </div>
            )}

        </Card>
      )}

    </div>
  );
}
