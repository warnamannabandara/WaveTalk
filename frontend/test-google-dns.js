const dns = require('dns');

const hostname = 'cluster0.lxrzv.mongodb.net';
const resolver = new dns.Resolver();

// Specifically use Google DNS
resolver.setServers(['8.8.8.8']);

console.log('Testing resolution with Google DNS (8.8.8.8)...');

resolver.resolve4(hostname, (err, addresses) => {
  if (err) {
    console.error('Resolution with Google DNS failed:', err.message);
    
    // Also try the SRV record with Google DNS
    resolver.resolveSrv(`_mongodb._tcp.${hostname}`, (err2, srvAddresses) => {
        if (err2) {
            console.error('SRV Resolution with Google DNS failed:', err2.message);
        } else {
            console.log('SRV Resolution Success with Google DNS:', srvAddresses);
        }
    });
  } else {
    console.log('Resolution Success with Google DNS:', addresses);
  }
});
