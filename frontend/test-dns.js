const dns = require('dns');

const hostname = '_mongodb._tcp.cluster0.lxrzv.mongodb.net';

dns.resolveSrv(hostname, (err, addresses) => {
  if (err) {
    console.error('DNS SRV Resolution Failed:', err);
    
    // Try resolving the main hostname just in case
    dns.lookup('cluster0.lxrzv.mongodb.net', (err2, address) => {
        if (err2) {
            console.error('Main Hostname Lookup Failed:', err2);
        } else {
            console.log('Main Hostname Resolved to:', address);
        }
    });
  } else {
    console.log('DNS SRV Resolution Success:', addresses);
  }
});
