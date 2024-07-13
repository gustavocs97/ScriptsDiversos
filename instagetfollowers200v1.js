fetch('https://www.instagram.com/api/v1/friendships/604323146/following/?count=200', {
  method: 'GET',
  headers: {
    'sec-ch-ua': '""',
    'sec-ch-prefers-color-scheme': 'light',
    'X-IG-WWW-Claim': 'hmac.AR1a-sraADTvKQXijQeq7fB9DLqTbndxl_Kdmp5KXezoVxHL',
    'X-IG-App-ID': '936619743392459',
    'sec-ch-ua-mobile': '?0',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
    'Accept': '*/*',
    'sec-ch-ua-platform-version': '""',
    'Referer': 'https://www.instagram.com/gus.tavocs/following/',
    'X-Requested-With': 'XMLHttpRequest',
    'X-ASBD-ID': '129477',
    'sec-ch-ua-full-version-list': '""',
    'X-CSRFToken': 'GkUgmhTLxL692tEono1m9bKlsXBKRxmw',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '""'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
