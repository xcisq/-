document.addEventListener('DOMContentLoaded', function() {
    const timeSlider = document.getElementById('timeSlider');
    const dateDisplay = document.getElementById('dateDisplay'); // 获取日期显示元素
    const imageDisplay = document.getElementById('imageDisplay');
    const startDate = new Date('2023-08-29'); // 设置滑动条对应的起始日期

    function updateDisplay(sliderValue) {
        // 计算当前日期
        const currentDate = new Date(startDate.getTime());
        currentDate.setDate(startDate.getDate() + parseInt(sliderValue));

        // 格式化日期为 YYYY-MM-DD 格式
        const formattedDate = currentDate.toISOString().split('T')[0];
        dateDisplay.textContent = formattedDate; // 更新日期显示

        // 直接基于滑块的值计算图片编号（从1开始）
        const dayNumber = parseInt(sliderValue) + 1; // 因为滑动条从0开始，而图片从001开始编号
        // 生成图片名称，确保编号至少为三位数
        const imageName = `concentration_map_day_${String(dayNumber).padStart(3, '0')}.png`;
        // 更新图片显示
        imageDisplay.innerHTML = `<img src="./static_3D/image/${imageName}" alt="Image for day ${dayNumber}" style="width: 100%; height: auto;">`;
    }

    // 监听滑动条变化
    timeSlider.addEventListener('input', function() {
        updateDisplay(this.value);
    });

    // 初始化页面显示
    updateDisplay(timeSlider.value);
});
