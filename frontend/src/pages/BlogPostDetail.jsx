import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'

const API_URL = 'http://localhost:3000'

export default function BlogPostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch(`${API_URL}/posts/${slug}`)
        const data = await res.json()
        
        if (data.success) {
          setPost(data.data)
          
          // Lấy bài viết liên quan cùng danh mục
          const catId = data.data.categories_post_id?._id
          if (catId) {
            try {
              const allRes = await fetch(`${API_URL}/posts`)
              const allData = await allRes.json()
              if (allData.success) {
                const filtered = allData.data
                  .filter(p => p.categories_post_id?._id === catId && p.slug !== slug)
                  .slice(0, 3)
                setRelated(filtered)
              }
            } catch (err) {
              console.error('Lỗi lấy bài viết liên quan:', err)
            }
          }
        } else {
          setError(data.message || 'Không tìm thấy bài viết')
        }
      } catch (err) {
        setError('Không thể kết nối server')
      } finally {
        setLoading(false)
      }
    }
    
    if (slug) {
      fetchPostDetail()
    }
  }, [slug])

  const getPostImg = (item, index = 0) => {
    const url = item.image || item.thumnail || ''
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

  if (loading) {
    return (
      <DefaultLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#fff', background: 'var(--black)' }}>
          ⏳ Đang tải bài viết...
        </div>
      </DefaultLayout>
    )
  }

  if (error || !post) {
    return (
      <DefaultLayout>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#fff', background: 'var(--black)', gap: '20px' }}>
          <h2>❌ {error || 'Không tìm thấy bài viết'}</h2>
          <Link to="/blog" style={{ background: 'var(--yellow)', color: '#000', textDecoration: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 600 }}>
            Quay lại Blog
          </Link>
        </div>
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
      <div className="blog-detail-wrapper" style={{ background: 'var(--black)', color: '#fff', padding: '30px 20px', minHeight: '80vh' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Breadcrumb */}
          <div style={{ fontSize: '13px', color: 'var(--gray2)', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'var(--gray2)', textDecoration: 'none' }}>Trang chủ</Link>
            <span>/</span>
            <Link to="/blog" style={{ color: 'var(--gray2)', textDecoration: 'none' }}>Blog</Link>
            <span>/</span>
            <span style={{ color: 'var(--yellow)' }}>{post.categories_post_id?.name || 'Bài viết'}</span>
          </div>

          {/* Header Info */}
          <header style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <span style={{ background: 'rgba(140, 80, 255, 0.2)', color: '#a78bfa', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                {post.categories_post_id?.name || 'Tin tức'}
              </span>
              <span style={{ color: 'var(--gray2)', fontSize: '13px' }}>
                📅 Đăng ngày: {formatDate(post.createdAt)}
              </span>
            </div>
            <h1 style={{ fontSize: '36px', lineHeight: '1.3', fontFamily: "'Oswald', sans-serif", margin: '0 0 10px 0', fontWeight: 'bold', color: '#fff' }}>
              {post.tittle}
            </h1>
          </header>

          {/* Main Image */}
          <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #222', marginBottom: '35px' }}>
            <img src={getPostImg(post)} alt={post.tittle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Post Content */}
          <article 
            className="post-content-body" 
            style={{ 
              fontSize: '16px', 
              lineHeight: '1.8', 
              color: '#e5e7eb',
              borderBottom: '1px solid #222',
              paddingBottom: '40px',
              marginBottom: '40px'
            }}
          >
            {/* Sử dụng dangerouslySetInnerHTML vì nội dung lưu trữ là HTML từ trình soạn thảo */}
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>

          {/* Related Posts */}
          {related.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '22px', borderLeft: '4px solid var(--yellow)', paddingLeft: '12px', marginBottom: '25px', textTransform: 'uppercase' }}>
                Bài viết liên quan
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {related.map((item, index) => (
                  <div 
                    key={item._id} 
                    style={{ 
                      background: 'var(--dark2)', 
                      borderRadius: '8px', 
                      overflow: 'hidden', 
                      border: '1px solid #222',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Link to={`/blog/${item.slug}`} style={{ height: '150px', display: 'block', overflow: 'hidden' }}>
                      <img src={getPostImg(item, index + 1)} alt={item.tittle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Link>
                    <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <span style={{ fontSize: '11px', color: 'var(--yellow)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                        {item.categories_post_id?.name || 'Bài viết'}
                      </span>
                      <h4 style={{ fontSize: '15px', margin: '0 0 10px 0', lineHeight: '1.4', fontWeight: 600, flexGrow: 1 }}>
                        <Link to={`/blog/${item.slug}`} style={{ color: '#fff', textDecoration: 'none' }}>
                          {item.tittle}
                        </Link>
                      </h4>
                      <span style={{ color: 'var(--gray2)', fontSize: '12px' }}>
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <style>{`
        .post-content-body p {
          margin-bottom: 20px;
        }
        .post-content-body h2 {
          font-size: 22px;
          margin-top: 30px;
          margin-bottom: 15px;
          color: #fff;
          font-weight: 600;
        }
        .post-content-body h3 {
          font-size: 19px;
          margin-top: 25px;
          margin-bottom: 12px;
          color: #fff;
          font-weight: 600;
        }
        .post-content-body ul, .post-content-body ol {
          margin-left: 20px;
          margin-bottom: 20px;
        }
        .post-content-body li {
          margin-bottom: 8px;
        }
      `}</style>
    </DefaultLayout>
  )
}
