import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'

const API_URL = 'http://localhost:3000'

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch categories
        const catRes = await fetch(`${API_URL}/post-categories`)
        const catData = await catRes.json()
        if (catData.success) {
          setCategories(catData.data)
        }

        // Fetch posts (only published ones)
        const postsRes = await fetch(`${API_URL}/posts?status=published`)
        const postsData = await postsRes.json()
        if (postsData.success) {
          setPosts(postsData.data)
        }
      } catch (err) {
        setError('Không thể kết nối với server!')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleCatClick = (slug) => {
    setSelectedCat(slug)
  }

  // Lọc bài viết theo danh mục
  const filteredPosts = selectedCat === 'all'
    ? posts
    : posts.filter(p => p.categories_post_id?.slug === selectedCat)

  const getPostImg = (post, index = 0) => {
    const url = post.thumnail || post.image || ''
    if (!url) {
      const fallbacks = [
        '/src/assets/images/blog1.png',
        '/src/assets/images/blog2.png',
        '/src/assets/images/blog3.png'
      ]
      return fallbacks[index % 3]
    }
    return url.startsWith('http') || url.startsWith('/src/') ? url : `${API_URL}${url}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <DefaultLayout>
      <div className="blog-page-wrapper" style={{ background: 'var(--black)', color: '#fff', minHeight: '80vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '42px', color: '#fff', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
              WINNO<span style={{ color: 'var(--yellow)' }}>TECH</span> BLOG
            </h1>
            <p style={{ color: 'var(--gray2)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
              Kiến thức công nghệ, hướng dẫn chọn cấu hình PC gaming và cập nhật tin tức linh kiện mới nhất từ Winno Tech.
            </p>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '35px', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
            <button
              onClick={() => handleCatClick('all')}
              style={{
                background: selectedCat === 'all' ? 'var(--yellow)' : 'var(--dark2)',
                color: selectedCat === 'all' ? '#000' : '#fff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => handleCatClick(cat.slug)}
                style={{
                  background: selectedCat === cat.slug ? 'var(--yellow)' : 'var(--dark2)',
                  color: selectedCat === cat.slug ? '#000' : '#fff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Loading & Error States */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray2)' }}>
              ⏳ Đang tải bài viết...
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          {/* Blog Grid */}
          {!loading && !error && (
            <>
              {filteredPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray2)' }}>
                  Chưa có bài viết nào thuộc danh mục này.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                  {filteredPosts.map((post, index) => (
                    <article 
                      key={post._id} 
                      className="blog-card"
                      style={{
                        background: 'var(--dark2)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid #222',
                        transition: 'transform 0.3s ease, border-color 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* Image container */}
                      <Link to={`/blog/${post.slug}`} style={{ overflow: 'hidden', height: '200px', display: 'block' }}>
                        <img 
                          src={getPostImg(post, index)} 
                          alt={post.tittle} 
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                          }}
                          className="blog-card-img"
                        />
                      </Link>

                      {/* Content */}
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ background: 'rgba(140, 80, 255, 0.15)', color: '#a78bfa', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                            {post.categories_post_id?.name || 'Tin tức'}
                          </span>
                          <span style={{ color: 'var(--gray2)', fontSize: '12px' }}>
                            {formatDate(post.createdAt)}
                          </span>
                        </div>

                        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', lineHeight: '1.4', fontWeight: 600 }}>
                          <Link to={`/blog/${post.slug}`} style={{ color: '#fff', textDecoration: 'none', transition: 'color 0.2s' }} className="blog-title-link">
                            {post.tittle}
                          </Link>
                        </h3>

                        <p style={{ color: 'var(--gray2)', fontSize: '13px', lineHeight: '1.6', margin: '0 0 20px 0', flexGrow: 1 }}>
                          {post.content ? (post.content.replace(/<[^>]*>/g, '').slice(0, 100) + '...') : ''}
                        </p>

                        <div style={{ borderTop: '1px solid #222', paddingTop: '15px' }}>
                          <Link to={`/blog/${post.slug}`} style={{ color: 'var(--yellow)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            Đọc thêm <span style={{ transition: 'transform 0.2s' }} className="arrow">→</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Add CSS effects inside JSX using style tag */}
          <style>{`
            .blog-card:hover {
              transform: translateY(-6px);
              border-color: var(--yellow) !important;
            }
            .blog-card:hover .blog-card-img {
              transform: scale(1.06);
            }
            .blog-title-link:hover {
              color: var(--yellow) !important;
            }
            .blog-card:hover .arrow {
              transform: translateX(4px);
            }
          `}</style>

        </div>
      </div>
    </DefaultLayout>
  )
}
