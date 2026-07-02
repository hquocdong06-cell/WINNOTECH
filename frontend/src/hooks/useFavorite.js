import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:3000';

export default function useFavorite() {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [isReady, setIsReady] = useState(false);

  // Fetch only IDs on mount to check which products are favorited
  useEffect(() => {
    const fetchFavoriteIds = async () => {
      try {
        const res = await fetch(`${API_URL}/favorites/ids`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setFavoriteIds(new Set(data.data));
          }
        }
      } catch (err) {
        console.log('Error fetching favorite IDs:', err);
      } finally {
        setIsReady(true);
      }
    };
    fetchFavoriteIds();
  }, []);

  const toggleFavorite = useCallback(async (productId) => {
    if (!productId) return;
    
    // Optimistic update
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });

    try {
      const res = await fetch(`${API_URL}/favorites/${productId}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        // Revert on failure
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(productId)) {
            newSet.delete(productId);
          } else {
            newSet.add(productId);
          }
          return newSet;
        });
        
        if (res.status === 401) {
          toast.info('Vui lòng đăng nhập để sử dụng tính năng yêu thích', { position: 'bottom-right' });
        } else {
          toast.error(data.message || 'Lỗi khi cập nhật yêu thích', { position: 'bottom-right' });
        }
      } else {
        if (data.action === 'added') {
          toast.success('Đã thêm vào danh sách yêu thích', { position: 'bottom-right', autoClose: 2000 });
        } else {
          toast.info('Đã xóa khỏi danh sách yêu thích', { position: 'bottom-right', autoClose: 2000 });
        }
      }
    } catch (err) {
      // Revert on failure
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(productId)) {
          newSet.delete(productId);
        } else {
          newSet.add(productId);
        }
        return newSet;
      });
      toast.error('Không thể kết nối tới server', { position: 'bottom-right' });
    }
  }, []);

  return { favoriteIds, toggleFavorite, isReady };
}
