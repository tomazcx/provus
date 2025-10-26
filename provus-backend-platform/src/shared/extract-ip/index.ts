import { Request } from 'express';

function isIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) {
    return false;
  }

  const octets = ip.split('.');
  return octets.every((octet) => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
}

export function extractIPv4(request: Request): string {
  const forwardedFor = request.headers['x-forwarded-for'] as string;
  const realIp = request.headers['x-real-ip'] as string;

  if (forwardedFor) {
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    for (const ip of ips) {
      if (isIPv4(ip)) {
        return ip;
      }
    }
  }

  if (realIp && isIPv4(realIp)) {
    return realIp;
  }

  const requestIp = request.ip;
  if (isIPv4(requestIp)) {
    return requestIp;
  }

  if (requestIp && requestIp.startsWith('::ffff:')) {
    return requestIp.substring(7);
  }

  return requestIp || 'unknown';
}
