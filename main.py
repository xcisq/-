import os
from flask import Flask, render_template, request, jsonify

# app = Flask(__name__)
app = Flask(__name__, template_folder=r"D:\\小徐快乐学习\\计设\\天津前端\\my_threeJS", static_folder=r"D:\\小徐快乐学习\\计设\\天津前端\\my_threeJS\\examples\\static_3D")


# 主页面
# @app.route('/')
# def index():
#     return render_template('examples/cube_v6.html')
@app.route('/')
def index():
    return render_template('examples/index.html')

@app.route('/to3D')
def to3D():
    return render_template('examples/cube_v6.html')

# "开始预报"路由
@app.route('/forecast', methods=['POST'])
def forecast():
    # 获取前端选择的要素
    element = request.json['element']

    # 日期
    date = request.json['date']

    # 预报模式
    mode = 'F'

    # 根据要素名，判断分辨率
    if element == 'swh' or element == 'sss':
        resolution = '0.1'
    else:
        resolution = '0.25'

    # print('要素：{}, 日期：{}, 模式：{}, 分辨率：{}'.format(element, date, mode, resolution))

    try:
        # 开始预报
        os.system(base_path + '/predict.sh {0} {1} {2} {3}'.format(element, date, mode, resolution))
        return jsonify({'success': True})
    except Exception as e:
        # 返回带有错误消息的响应给前端
        return jsonify({'success': False, 'error': str(e)})


# "开始订正"路由
@app.route('/biasCorrect', methods=['POST'])
def biasCorrect():
    # 获取前端选择的要素
    element = request.json['element']

    # 日期
    date = request.json['date']

    # 订正模式
    mode = 'C'

    # 根据要素名，判断分辨率
    if element == 'swh' or element == 'sss':
        resolution = '0.1'
    else:
        resolution = '0.25'

    # print('要素：{}, 日期：{}, 模式：{}, 分辨率：{}'.format(element, date, mode, resolution))

    try:
        # 开始偏差订正
        os.system(base_path + '/predict.sh {0} {1} {2} {3}'.format(element, date, mode, resolution))
        return jsonify({'success': True})
    except Exception as e:
        # 返回带有错误消息的响应给前端
        return jsonify({'success': False, 'error': str(e)})


# 开始反演
@app.route('/inversion', methods=['POST'])
def inversion():
    # 获取前端选择的要素
    element = request.json['element']

    # 日期
    date = request.json['date']

    # 预报模式
    mode = 'F'

    # 根据要素名，判断分辨率
    if element == '3DS':
        resolution = '0.1'  # 盐度
    else:
        resolution = '0.1'  # 温度

    print('要素：{}, 日期：{}, 模式：{}, 分辨率：{}'.format(element, date, mode, resolution))

    # 开始预报
    os.system(base_path + '/predict.sh {0} {1} {2} {3}'.format(element, date, mode, resolution))
    print('python端完成反演')
    return 'ok'


if __name__ == '__main__':
    base_path = os.path.dirname(__file__)
    app.run(debug=True)
