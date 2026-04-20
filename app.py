from flask import Flask, render_template, request, jsonify, send_file
import io
import json
import random
import string
from datetime import datetime

app = Flask(__name__)

# Store bill history in memory (temporary, resets on restart)
bill_history = []

@app.route('/')
def index():
    """Render the main bill page"""
    return render_template('index.html')


@app.route('/api/save-bill', methods=['POST'])
def save_bill():
    """Save bill to history"""
    try:
        bill_data = request.get_json()

        if not bill_data:
            return jsonify({'success': False, 'error': 'No data received'}), 400

        bill_data['id'] = ''.join(random.choices(string.digits, k=6))
        bill_data['saved_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        bill_history.append(bill_data)

        return jsonify({'success': True, 'bill_id': bill_data['id']})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/bill-history', methods=['GET'])
def get_bill_history():
    """Get last 10 saved bills"""
    return jsonify(bill_history[-10:])


@app.route('/api/bill/<bill_id>', methods=['GET'])
def get_bill(bill_id):
    """Get specific bill by ID"""
    for bill in bill_history:
        if bill.get('id') == bill_id:
            return jsonify(bill)

    return jsonify({'error': 'Bill not found'}), 404


@app.route('/api/clear-history', methods=['POST'])
def clear_history():
    """Clear all bill history"""
    bill_history.clear()
    return jsonify({'success': True})


@app.route('/api/export-bill', methods=['POST'])
def export_bill():
    """Export bill as JSON file"""
    try:
        bill_data = request.get_json()

        if not bill_data:
            return jsonify({'error': 'No data provided'}), 400

        json_data = json.dumps(bill_data, indent=2)

        mem_file = io.BytesIO()
        mem_file.write(json_data.encode('utf-8'))
        mem_file.seek(0)

        filename = f"bill_{bill_data.get('bill_no', '000')}_{datetime.now().strftime('%Y%m%d')}.json"

        return send_file(
            mem_file,
            as_attachment=True,
            download_name=filename,
            mimetype='application/json'
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/save-date', methods=['POST'])
def save_date():
    """Save selected date (debug/logging)"""
    data = request.get_json()
    date = data.get('date') if data else None

    if not date:
        return jsonify({'error': 'No date provided'}), 400

    print("Saved Date:", date)
    return jsonify({"status": "success"})


# ✅ Required for Render / production
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)