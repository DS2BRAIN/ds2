def get_payment_redirection_html(front_url, result):
    html_file = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="refresh" content="0; URL={front_url}/admin/setting/payment?exim_result={result}">
</head>
<body>
</body>
</html>"""
    return html_file