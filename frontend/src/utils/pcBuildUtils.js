/**
 * Tiện ích hỗ trợ quản lý cấu hình PC Builder trong localStorage
 */

/**
 * Xóa các linh kiện đã chọn của cấu hình PC vừa được thanh toán thành công
 */
export function clearPurchasedPCBuildConfig() {
  try {
    const configId = localStorage.getItem('purchasing_pc_build_config_id')
    if (configId) {
      const saved = localStorage.getItem('winnotech_pc_build_configs')
      if (saved) {
        const configs = JSON.parse(saved)
        if (Array.isArray(configs)) {
          const updated = configs.map(cfg => {
            if (cfg.id === Number(configId)) {
              return { ...cfg, selected: {} }
            }
            return cfg
          })
          localStorage.setItem('winnotech_pc_build_configs', JSON.stringify(updated))
        }
      }
      localStorage.removeItem('purchasing_pc_build_config_id')
    }
  } catch (err) {
    console.error('Lỗi khi xóa cấu hình PC đã mua:', err)
  }
}
