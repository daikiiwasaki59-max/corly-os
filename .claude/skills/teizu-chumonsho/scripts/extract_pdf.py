"""Gmail get_message(RAW)がtool-resultsに保存したJSONから、添付PDFを取り出す。

使い方: python3 extract_pdf.py <tool-resultsのJSON> <出力PDF>
添付ファイル名は get_message(PLAIN_TEXT) の attachments[].filename を使うこと
(RAWから読んだ名前はMIMEエンコードのまま化けることがある)。
"""
import sys, json, base64, email
from email import policy

d = json.load(open(sys.argv[1]))
msg = email.message_from_bytes(base64.urlsafe_b64decode(d['raw'] + '==='), policy=policy.default)
for part in msg.walk():
    if part.get_content_type() == 'application/pdf':
        data = part.get_payload(decode=True)
        open(sys.argv[2], 'wb').write(data)
        print("saved", sys.argv[2], len(data))
        break
else:
    sys.exit("PDF添付が見つかりません")
