import { PUBLIC_API_WEB3FORM } from 'astro:env/client';
import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

type FormContactPropsType = {
  className: string;
};

export default function FormContact(props: FormContactPropsType) {
  const { className } = props;
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useForm<FormData>({
    mode: 'onTouched',
  });
  const [isSuccess, setIsSuccess] = React.useState(true);
  const [Message, setMessage] = React.useState('');

  const userName = useWatch({
    control,
    name: 'name',
    defaultValue: 'Someone',
  });

  useEffect(() => {
    setValue('subject', `${userName} sent a message from Website`);
  }, [userName, setValue]);

  type FormData = {
    access_key: string;
    subject: string;
    from_name: string;
    botcheck: boolean;
    name: string;
    email: string;
    company: string;
    budget: string;
    message: string;
  };

  type ApiResponse = {
    success: boolean;
    message: string;
  };

  const onSubmit = async (data: FormData) => {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data, null, 2),
    })
      .then(async (response) => {
        const json: ApiResponse = await response.json();
        if (json.success) {
          setIsSuccess(true);
          reset();
        } else {
          setIsSuccess(false);
        }
      })
      .catch((error) => {
        setIsSuccess(false);
        setMessage('Client Error. Please check the console.log for more info');
        // eslint-disable-next-line no-console
        console.log(error);
      });
  };

  return (
    <>
      <div className={className}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="hidden"
            value={PUBLIC_API_WEB3FORM}
            {...register('access_key')}
          />
          <input
            type="hidden"
            {...register('subject')}
          />
          <input
            type="hidden"
            value="Mission Control"
            {...register('from_name')}
          />
          <input
            type="checkbox"
            id=""
            className="hidden"
            style={{ display: 'none' }}
            {...register('botcheck')}
          />
          <div className="grid grid-cols-1 bg-black lg:grid-cols-2">
            <div className="relative mb-0">
              <input
                type="text"
                placeholder="Full Name"
                autoComplete="false"
                className={`w-full border-4 border-black bg-black px-6 py-5 text-xl text-white outline-none focus:border-black focus:bg-white focus:text-black lg:text-4xl  ${
                  errors.name
                    ? ''
                    : ''
                }`}
                {...register('name', {
                  required: '*required',
                  maxLength: 80,
                })}
              />
              {errors.name && (
                <div className="absolute right-2 top-1/2 mb-1 -translate-y-1/2 text-red-600">
                  <small>{errors.name.message}</small>
                </div>
              )}
            </div>

            <div className="relative mb-0">
              <label htmlFor="email_address" className="sr-only">
                Email Address
              </label>
              <input
                id="email_address"
                type="email"
                placeholder="Email Address"
                autoComplete="false"
                className={`w-full border-4 border-black bg-black px-6 py-5 text-xl text-white outline-none focus:border-black focus:bg-white focus:text-black lg:text-4xl  ${
                  errors.email
                    ? ''
                    : ''
                }`}
                {...register('email', {
                  required: '*required',
                  maxLength: 80,
                  pattern: {
                    value: /^\S[^\s@]*@\S+$/,
                    message: '*not a valid email',
                  },
                })}
              />
              {errors.email && (
                <div className="absolute right-2 top-1/2 mb-1 -translate-y-1/2 text-red-600">
                  <small>{errors.email.message}</small>
                </div>
              )}
            </div>

            <div className="relative mb-0">
              <label htmlFor="company" className="sr-only">
                Company
              </label>
              <input
                id="company"
                type="text"
                placeholder="Company"
                autoComplete="false"
                className={`w-full border-4 border-black bg-black px-6 py-5 text-xl text-white outline-none focus:border-black focus:bg-white focus:text-black lg:text-4xl  ${
                  errors.name
                    ? ''
                    : ''
                }`}
                {...register('company', {
                  maxLength: 80,
                })}
              />
            </div>

            <div className="relative mb-0">
              <label htmlFor="budget" className="sr-only">
                Company
              </label>
              <select
                id="budget"
                autoComplete="false"
                className={`w-full border-4 border-black bg-black px-6 py-4 text-xl text-white outline-none [height:88px] focus:border-black focus:bg-white focus:text-black lg:text-4xl ${
                  errors.budget
                    ? ''
                    : ''
                }`}
                {...register('budget', {
                  required: '*required',
                })}
              >
                <option value="" className="text-slate-400">Select budget (USD)</option>
                <option value="Under 1k (USD)">Under 1k (USD)</option>
                <option value="1K - 5K (USD)">1K - 5K (USD)</option>
                <option value="5K+ (USD)">5K+ (USD)</option>
              </select>
              {errors.budget && (
                <div className="absolute right-2 top-1/2 mb-1 -translate-y-1/2 text-red-600">
                  <small>{errors.budget.message}</small>
                </div>
              )}
            </div>

            <div className="relative mb-0 lg:col-span-2">
              <textarea
                placeholder="Message"
                className={`h-56 w-full border-4 border-black bg-black px-6 py-5 text-xl text-white outline-none focus:border-black focus:bg-white focus:text-black lg:text-4xl ${
                  errors.message
                    ? ''
                    : ''
                }`}
                {...register('message', {
                  required: '*required',
                  maxLength: 15000,
                })}
              />
              {errors.message && (
                <div className="absolute right-2 top-1/2 mb-1 -translate-y-1/2 text-red-600">
                  {' '}
                  <small>{errors.message.message}</small>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full border-4 border-black bg-transparent px-7 py-4 text-xl font-bold transition-colors hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-offset-2 lg:text-4xl dark:border-white dark:hover:border-indigo-500"
          >
            {isSubmitting
              ? (
                  <svg
                    className="mx-auto size-5 animate-spin text-black dark:text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                    </circle>
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    >
                    </path>
                  </svg>
                )
              : (
                  'Send Message'
                )}
          </button>
        </form>
        {isSubmitSuccessful && isSuccess && (
          <>
            <div className="flex flex-col items-center justify-center rounded-md text-center text-white">
              <p className="py-5 text-2xl">Thank you for reaching out! I'll get back to you soon.</p>
              <button
                className="mt-2 font-semibold focus:outline-none"
                onClick={() => reset()}
                type="button"
              >
                X
              </button>
            </div>
          </>
        )}

        {isSubmitSuccessful && !isSuccess && (
          <div className="flex flex-col items-center justify-center rounded-md text-center">
            <h3 className="py-7 text-2xl">Oops, Something went wrong!</h3>
            <p className="text-gray-300 md:px-3">{Message}</p>
          </div>
        )}
      </div>
    </>
  );
}
