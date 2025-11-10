'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Button, Input, Spin, Table } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

import Header from '@/components/header/header';
import RemoveProductModal from '@/components/delete-product/delete-product';
import { CartItemType } from '@/types/cart';

import { formatPrice, TAX_RATE } from '@/lib/utils';

import './page.css';

type TableRowSelection<T extends object = object> =
  TableProps<T>['rowSelection'];

const ShoppingBagPage: React.FC = () => {
  const [deleteTarget, setDeleteTarget] = useState<CartItemType | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const timer = setTimeout(() => {
      const storageKey = `cart_${session.user.id}`;
      const storedCart = localStorage.getItem(storageKey);

      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        setDataSource(parsed);
      }

      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [session]);

  const updateQty = (key: number, type: 'inc' | 'dec') => {
    let shouldShowToast = false;
    setDataSource((prev) => {
      const updated = prev.map((item) => {
        if (item.key !== key) return item;

        if (type === 'inc') {
          if (item.qty < item.stock) {
            return { ...item, qty: item.qty + 1 };
          } else {
            shouldShowToast = true;
            return item;
          }
        } else {
          return { ...item, qty: item.qty > 1 ? item.qty - 1 : 1 };
        }
      });

      localStorage.setItem(`cart_${session?.user.id}`, JSON.stringify(updated));
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'));
      }, 0);
      return updated;
    });
    if (shouldShowToast) {
      toast.error('Only limited stock available!');
    }
  };

  const handleDelete = (key: number) => {
    setDataSource((prev) => {
      const updated = prev.filter((item) => item.key !== key);
      localStorage.setItem(`cart_${session?.user.id}`, JSON.stringify(updated));
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'));
      }, 0);
      return updated;
    });
    setDeleteTarget(null);
  };

  const handleCheckout = async () => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    const cart = JSON.parse(
      localStorage.getItem(`cart_${session.user.id}`) || '[]'
    );
    if (!cart.length) {
      toast.error('Your cart is empty!');
      return;
    }
    const outOfStockItems = cart.filter(
      (item: CartItemType) => item.qty > item.stock
    );

    if (outOfStockItems.length > 0) {
      outOfStockItems.forEach((item: CartItemType) => {
        toast.error(
          `${item.title}(${item.color}) has only ${item.stock} left in stock — please adjust quantity.`
        );
      });
      return;
    }
    setIsCheckoutProcessing(true);
    console.log(JSON.stringify(cart));
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          userId: session.user.id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (Array.isArray(data.errors)) {
          const updatedCart = [...cart];

          data.errors.forEach((errMsg: string) => {
            toast.error(errMsg);

            const stockMatch = errMsg.match(/Only (\d+) left/);
            const newStock = stockMatch ? Number(stockMatch[1]) : null;

            const titleMatch = errMsg.match(/product (.+?) with/i);
            const title = titleMatch ? titleMatch[1].trim() : null;

            if (title && newStock !== null) {
              const index = updatedCart.findIndex(
                (item) => item.title === title
              );

              if (index !== -1) {
                updatedCart[index].stock = newStock;
              }
            }
          });

          setDataSource(updatedCart);
          localStorage.setItem(
            `cart_${session.user.id}`,
            JSON.stringify(updatedCart)
          );

          setIsCheckoutProcessing(false);
          return;
        }
        toast.error(data.error || 'Checkout failed!');
        setIsCheckoutProcessing(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error('Unexpected error during checkout');
      setIsCheckoutProcessing(false);
    }
  };
  const handleDeleteSelected = () => {
    if (selectedRowKeys.length === 0) {
      toast.error('No products selected!');
      return;
    }

    setDataSource((prev) => {
      const updated = prev.filter(
        (item) => !selectedRowKeys.includes(item.key)
      );
      localStorage.setItem(`cart_${session?.user.id}`, JSON.stringify(updated));
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'));
      }, 0);
      return updated;
    });

    setSelectedRowKeys([]);
    toast.success('Selected products removed!');
  };

  const { subTotal, tax, total } = useMemo(() => {
    const subTotal = dataSource.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );
    const tax = subTotal * TAX_RATE;
    const total = subTotal + tax;
    return { subTotal, tax, total };
  }, [dataSource]);

  const columns: TableColumnsType<CartItemType> = [
    {
      title: 'Product',
      dataIndex: 'product',
      className: 'table-cell',
      onCell: () => ({
        style: {
          minWidth: '200px'
        }
      }),
      render: (_, record) => (
        <div className="product-container">
          <Image
            src={record.image || '/placeholder.png'}
            alt={record.title}
            width={24}
            height={24}
            className="product-image"
          />
          <span className="product-name">{record.title}</span>
        </div>
      )
    },
    {
      title: 'Color',
      dataIndex: 'color',
      onCell: () => ({
        style: {
          minWidth: '200px'
        }
      }),
      render: (_, record) => (
        <div className="color-container">
          <span
            className="color-circle"
            style={{ backgroundColor: record.colorCode }}
          />
          <span className="color-text">{record.color}</span>
        </div>
      )
    },
    {
      title: 'Size',
      dataIndex: 'size'
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      render: (price) => formatPrice(price)
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      onCell: () => ({
        style: {
          minWidth: '200px'
        }
      }),
      render: (qty, record) => (
        <div className="quantity-container">
          <Button
            className="quantity-btn-decrement"
            style={{ borderColor: '#DFDFDF' }}
            disabled={qty <= 1}
            onClick={() => updateQty(record.key, 'dec')}
          >
            -
          </Button>
          <Input
            type="number"
            min={1}
            max={record.stock}
            value={qty}
            className="quantity-display"
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > record.stock) {
                toast.error(`Only ${record.stock} items in stock!`);
                return;
              }
              if (value >= 1) {
                setDataSource((prev) => {
                  const updated = prev.map((item) =>
                    item.key === record.key ? { ...item, qty: value } : item
                  );
                  localStorage.setItem(
                    `cart_${session?.user.id}`,
                    JSON.stringify(updated)
                  );
                  window.dispatchEvent(new Event('cartUpdated'));
                  return updated;
                });
              }
            }}
          />

          <Button
            className="quantity-btn-increment"
            style={{ borderColor: '#DFDFDF' }}
            disabled={qty >= record.stock}
            onClick={() => updateQty(record.key, 'inc')}
          >
            +
          </Button>
        </div>
      )
    },
    {
      title: 'Total Price',
      dataIndex: 'price',
      onCell: () => ({
        style: {
          minWidth: '200px'
        }
      }),
      render: (price, record) => formatPrice(price * record.qty)
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      onCell: () => ({
        style: {
          minWidth: '200px'
        }
      }),
      render: (_, record) => (
        <Image
          src="/delete.png"
          alt="Delete"
          width={16}
          height={16}
          className="delete-icon"
          onClick={() => setDeleteTarget(record)}
        />
      )
    }
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<CartItemType> = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }
  if (isCheckoutProcessing) {
    return (
      <div className="checkout-loading">
        <Spin size="large" />
        <p className="checkout-loading-p">
          Your order is being processed. You will be redirected to the payment
          page shortly.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="main-container">
        <div className="header-container">
          <div className="header-left">
            <ArrowLeftOutlined
              style={{ color: '#007BFF' }}
              onClick={() => router.push('/')}
            />
            <h4 className="shopping-bag-title">Your Shopping Bag</h4>
          </div>
          {selectedRowKeys.length > 0 && (
            <Button
              type="primary"
              danger
              onClick={() => setDeleteSelectedOpen(true)}
              className="delete-selected-btn"
            >
              Delete Selected
            </Button>
          )}
        </div>

        <div className="table-wrapper">
          <Table<CartItemType>
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: 1000 }}
            bordered
            rowClassName={() => 'h-12'}
            locale={{
              emptyText: (
                <div className="empty-cart-container">
                  <p className="empty-cart-text">
                    There are no items in this cart
                  </p>
                  <Button
                    onClick={() => router.push('/')}
                    className="continue-shopping-btn"
                  >
                    Continue Shopping
                  </Button>
                </div>
              )
            }}
          />
        </div>
        <div className="summary">
          <div className="price-row-subtotal">
            <p className="price-label">Sub Total:</p>
            <p className="price-value">{formatPrice(subTotal)}</p>
          </div>
          <div className="price-row-tax">
            <p className="price-label">Tax (10%):</p>
            <p className="price-value">{formatPrice(tax)}</p>
          </div>
          <div className="price-row-total">
            <p className="price-label">Total:</p>
            <p className="price-value">{formatPrice(total)}</p>
          </div>
          <div className="place-order-container">
            <Button
              className="place-order-btn"
              onClick={handleCheckout}
              loading={isCheckoutProcessing}
              disabled={isCheckoutProcessing}
            >
              <div className="place-order-text">Buy Now</div>
            </Button>
          </div>
        </div>
      </div>
      {deleteTarget && (
        <RemoveProductModal
          title="Remove Product"
          message={
            <>
              Are You Sure You Want To Delete{' '}
              <span className="remove-product-span">{deleteTarget.title}</span>?
            </>
          }
          onConfirm={() => handleDelete(deleteTarget.key)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {deleteSelectedOpen && (
        <RemoveProductModal
          title="Remove Products"
          message={`Are You Sure You Want To Delete ${selectedRowKeys.length} Selected Items!`}
          onConfirm={() => {
            handleDeleteSelected();
            setDeleteSelectedOpen(false);
          }}
          onCancel={() => setDeleteSelectedOpen(false)}
        />
      )}
    </div>
  );
};

export default ShoppingBagPage;
