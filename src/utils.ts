export function toLocalhost(ip: string): string {
    // Regex for local IPv4 and IPv6 addresses
    const ipv4LocalRegex = /^(127\.\d{1,3}\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|0\.0\.0\.0)$/;
    const ipv6LocalRegex = /^(::1|fc00:|fd00:|::)$/;

    if (ipv4LocalRegex.test(ip) || ipv6LocalRegex.test(ip)) {
        return 'localhost';
    }

    return ip; // Return original IP if not local
}

// console.log(toLocalhost("127.0.0.1"));  // localhost
// console.log(toLocalhost("192.168.1.1")); // localhost
// console.log(toLocalhost("::1"));         // localhost
// console.log(toLocalhost("8.8.8.8"));     // 8.8.8.8