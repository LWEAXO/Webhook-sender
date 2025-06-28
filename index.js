const readline = require('readline');
const axios = require('axios');
const colors = require('colors');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function webhookGonder(url, mesaj, miktar) {
  let basariliGonderim = 0;
  let basarisizGonderim = 0;
  
  console.log(`\n${miktar} adet mesaj gönderiliyor...\n`.yellow);
  
  for (let i = 1; i <= miktar; i++) {
    try {
      await axios.post(url, {
        content: mesaj
      });
      
      basariliGonderim++;
      console.log(`[${i}/${miktar}] Mesaj başarıyla gönderildi!`.green);
      
      if (i < miktar) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      basarisizGonderim++;
      console.error(`[${i}/${miktar}] Mesaj gönderilemedi: ${error.message}`.red);
      
      if (error.response && error.response.status === 429) {
        const beklemeSuresi = error.response.data.retry_after || 5;
        console.log(`Rate limit! ${beklemeSuresi} saniye bekleniyor...`.magenta);
        await new Promise(resolve => setTimeout(resolve, beklemeSuresi * 1000));
        i--;
      }
    }
  }
  
  console.log(`\nİşlem tamamlandı!`.rainbow.bold);
  console.log(`Başarılı gönderim: ${basariliGonderim}`.green.bold);
  console.log(`Başarısız gönderim: ${basarisizGonderim}`.red.bold);
}

function baslat() {
  console.log('Discord Webhook Gönderici'.bold.blue.bold);
  console.log('=========================\n'.blue.bold);
  
  rl.question('Webhook URL girin: '.yellow.bold, (url) => {
    if (!url.startsWith('https://discord.com/api/webhooks/')) {
      console.log('Geçersiz webhook URL. "https://discord.com/api/webhooks/" ile başlamalı'.red.bold);
      rl.close();
      return;
    }
    
    rl.question('Gönderilecek mesajı girin: '.yellow.bold, (mesaj) => {
      rl.question('Gönderim adedini girin: '.yellow.bold, (miktar) => {
        const sayi = parseInt(miktar);
        if (isNaN(sayi)) {
          console.log('Lütfen geçerli bir sayı girin'.red.bold);
          rl.close();
          return;
        }
        
        webhookGonder(url, mesaj, sayi)
          .then(() => rl.close())
          .catch(() => rl.close());
      });
    });
  });
}

baslat();