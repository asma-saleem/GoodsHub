'use client';

interface RemoveProductModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RemoveProductModal({
  onConfirm,
  onCancel
}: RemoveProductModalProps) {
  return (
    <div className='fixed inset-0 bg-gray-400 flex items-center justify-center p-4 z-50'>
      {/* Modal Container */}
      <div className='bg-white rounded-[4px] border border-blue-500 p-8 max-w-md w-full mx-4 shadow-xl'>
        {/* Header */}
        <div className='text-center mb-6'>
          <h4 className='font-inter font-medium text-[24px] leading-[28.8px] tracking-[0px] text-[#007BFF] pb-[12px]'>
            Remove Product
          </h4>

          {/* Warning Icon */}
          <div className='flex justify-center mb-8'>
            <svg
              className='w-[72px] h-[72px] text-yellow-500'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
              />
            </svg>
          </div>

          {/* Confirmation Text */}
          <p className='text-xl font-semibold text-gray-800 mb- leading-relaxed'>
            Are You Sure You Want To
            <br />
            Delete The Item!
          </p>
        </div>

        {/* Buttons */}
        <div className='flex gap-6 justify-center'>
          <button
            onClick={onCancel}
            className='px-12 py-3 border-2 border-blue-500 text-blue-500 bg-white rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors min-w-[120px]'
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className='px-12 py-3 bg-blue-500 text-white rounded-lg text-lg font-medium hover:bg-blue-600 transition-colors min-w-[120px]'
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
