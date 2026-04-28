export function initScanner(containerId, onDetected) {
  import('https://cdn.skypack.dev/@ericblade/quagga2').then(Quagga => {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.getElementById(containerId),
        constraints: { facingMode: "environment" }
      },
      decoder: { readers: ["ean_reader", "ean_8_reader", "code_128_reader"] }
    }, (err) => {
      if (err) { console.error(err); return; }
      Quagga.start();
    });

    Quagga.onDetected((data) => {
      const code = data.codeResult.code;
      Quagga.stop();
      onDetected(code);
    });
  });
}
