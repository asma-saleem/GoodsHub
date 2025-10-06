'use client';

import { Button } from 'antd';
import React from 'react';

import './delete-product.css';

interface RemoveProductModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: React.ReactNode; 
}

export default function RemoveProductModal({
  onConfirm,
  onCancel,
  title = 'Remove Product',
  message = 'Are You Sure You Want To Delete The Item!'
}: RemoveProductModalProps) {
  return (
    <div className='modal-overlay'>
      <div className='modal-container'>
        <div className='modal-header'>
          <h4 className='modal-title'>
            {title}
          </h4>
          <div className='modal-icon'>
            <svg
              className='icon-warning'
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
          <p className='modal-message'>
            {message}
          </p>
        </div>
        <div className='modal-buttons'>
          <Button
            onClick={onCancel}
            className='btn-cancel'
          >
            No
          </Button>
          <Button
            onClick={onConfirm}
            className='btn-confirm'
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
}
