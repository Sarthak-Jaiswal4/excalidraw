import Redis from 'ioredis'

const redisConfig = {
    username: 'default',
    password: 'mpZbNvRxYHTOKNUZ1iGPRBVF6Bpav0Qw',
    socket: {
        host: 'redis-16343.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 16343
    }
};

if (!redisConfig.password || !redisConfig.socket.host) {
    throw new Error('Missing required Redis environment variables: REDIS_PASSWORD and REDIS_HOST');
}

export const pub = new Redis(redisConfig);
export const sub = new Redis(redisConfig);