npm install

npm run dev

 - Go to "Editor 1" tab
 - write somethin in Editor 1 input
 - click in "DOWNLOAD CSV"
 - note that the shouldBlockFn is triggered - and the only way to download the CSV is clicking in "Leave", which is not at all intuitive for the user

 ![evidence](./public/evidence.png)

![image](https://github.com/user-attachments/assets/3be4c292-222c-4a3f-b1bf-80f845f87e66)
Sorry, this is not from react-router.
Actually, the shouldBlockFn is not triggered in this case. This is a DEFAULT behavior when we are downloading a "downloadable url" using the handleDownload in the code...
const handleDownload = (url: string) => { const link = document.createElement("a"); link.href = url; document.body.appendChild(link); link.click(); document.body.removeChild(link); };

Sorry, im closing this issue. The lib works fine, thanks a lot.
ISSUED closed (not a bug, is a default behavior from browsers): https://github.com/TanStack/router/issues/3203
