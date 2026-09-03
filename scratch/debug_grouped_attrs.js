const http = require('http');

http.get('http://localhost:3000/products/gskill-trident-z5-rgb-ddr5-32gb', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const Variants = json.data?.Variants || [];
    console.log('Variants count:', Variants.length);

    const specFilterOut = [
      'thương hiệu', 'bảo hành', 'nhu cầu', 'kiểu kết nối', 'kết nối', 
      'kiểu cầm', 'switch', 'độ phân giải (cpi/dpi)', 'độ phân giải', 
      'tên cảm biến', 'cảm biến', 'số nút bấm', 'kích thước', 'khối lượng',
      'tên', 'part-number', 'kết nối bàn phím', 'loại bàn phím', 'đèn', 'kiểu switch',
      'loại hàng', 'đèn led', 'thế hệ', 'bus', 'timing', 'voltage',
      'chipset', 'socket', 'khe ram tối đa', 'kiểu ram hỗ trợ', 'hỗ trợ bộ nhớ tối đa', 
      'bus ram hỗ trợ', 'lưu trữ', 'kiểu khe m.2 hỗ trợ', 'cổng xuất hình', 'khe pci', 
      'số cổng usb', 'lan', 'âm thanh',
      'công suất tối đa', 'hiệu suất', 'số cổng cắm', 'quạt làm mát', 'nguồn đầu vào',
      'dạng tản nhiệt', 'kích thước quạt (mm)', 'socket được hỗ trợ', 'chất liệu tản nhiệt', 
      'kích thước radiator (cm)', 'chiều cao (cm)', 'số vòng quay của quạt (rpm)', 
      'lưu lượng không khí (cfm)', 'độ ồn (dba)', 'khối lượng (kg)',
      'tên của case', 'chất liệu', 'loại case', 'hỗ trợ mainboard', 'số lượng ổ đĩa hỗ trợ', 
      'hỗ trợ tản nhiệt cpu cao', 'loại quạt hỗ trợ phía trên', 'loại quạt hỗ trợ phía sau', 
      'loại quạt hỗ trợ bên dưới', 'ổ đĩa hỗ trợ', 'tản nhiệt cpu cao', 'quạt hỗ trợ',
      'kiểu ổ cứng', 'màu sắc của ổ cứng', 'tốc độ vòng quay', 'tốc độ đọc', 'tốc độ ghi',
      'giao tiếp', 'tbw', 'form factor', 'nand', 'controller',
      'weight', 'dimensions', 'sensor',
      'tần số quét', 'thời gian phản hồi', 'tỉ lệ', 'độ tương phản tĩnh', 'độ sáng',
      'góc nhìn', 'độ phủ màu', 'số lượng màu', 'tấm nền', 'công nghệ đồng bộ',
      'công suất', 'kiểu màn hình', 'chuẩn gắn arm', 'phụ kiện đi kèm',
      'kích thước (có chân)', 'kích thước (không chân)', 'khối lượng (có chân)', 'khối lượng (không chân)',
      'series', 'phiên bản / dung lượng', 'phiên bản'
    ];

    const groups = {};
    Variants.forEach(v => {
      (v.Attributes || []).forEach(a => {
        let groupName = a.attribute_name || a.name || 'Thuộc tính';
        const valName = a.value_name || a.value;
        const lowerName = groupName.trim().toLowerCase();
        const filtered = specFilterOut.some(s => lowerName === s || lowerName.includes(s) || s.includes(lowerName));
        console.log(`Attr: "${groupName}", val: "${valName}" -> filtered?`, filtered);
        if (!filtered) {
          if (!groups[groupName]) groups[groupName] = [];
          groups[groupName].push({ val: valName, v_id: v._id });
        }
      });
    });
    console.log('Result groups:', groups);
  });
});
