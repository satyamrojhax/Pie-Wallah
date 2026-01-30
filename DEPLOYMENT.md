# Pie Wallah Deployment Guide

## Overview

This guide covers deployment options for the Pie Wallah educational platform, including Vercel, Netlify, and Docker deployments.

**📦 Repository**: [https://github.com/satyamrojhax/piewallahapp](https://github.com/satyamrojhax/piewallahapp)
**📖 Documentation**: [README.md](./README.md)
**🚀 Live Demo**: [https://piewallah.vercel.app/](https://piewallah.vercel.app/)

## Prerequisites

### General Requirements
- Node.js 18+ and npm installed
- Git repository with the project code
- Environment variables configured

### Platform-Specific
- **Vercel**: Vercel account and GitHub integration
- **Netlify**: Netlify account and GitHub integration  
- **Docker**: Docker installed and configured
- **Custom**: Web server with Node.js support

## Quick Deployment Options

### 1. Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/satyamrojhax/piewallahapp)

### 2. Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/satyamrojhax/piewallahapp)

### 3. Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/satyamrojhax/piewallahapp)

## Manual Deployment Steps

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/satyamrojhax/piewallahapp.git
cd piewallahapp

# Install dependencies
npm install

# Test build locally
npm run build
```

### 2. Environment Variables

Create environment variables for your deployment platform:

#### Required Variables
```env
# API Configuration (Contact development team for values)
VITE_API_BASE_URL=your_api_base_url
VITE_VIDEO_API_BASE_URL=your_video_api_base_url
VITE_VIDEO_API_PROXY_BASE_URL=your_proxy_base_url

# Application (Optional)
VITE_APP_NAME=Pie Wallah
VITE_APP_VERSION=1.0.0
```

#### Authentication Headers (Built-in)
The application automatically includes secure authentication headers for API requests. All sensitive headers are managed through secure configuration files and are not exposed in the deployment configuration.

### 3. Build Configuration

#### Vercel
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: `18.x` or higher
- **Install Command**: `npm install`

#### Netlify
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node.js Version**: `18`
- **Environment Variables**: Set in Netlify dashboard

## Platform-Specific Deployment

### Vercel (Recommended)

#### Setup
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings (see above)
4. Add environment variables in Vercel dashboard
5. Deploy

#### Benefits
- Automatic SSL certificates
- Global CDN distribution
- Automatic deployments from Git
- Built-in analytics and performance monitoring

### Netlify

#### Setup
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Configure build settings (see above)
4. Add environment variables
5. Deploy

#### Benefits
- Continuous deployment
- Form handling
- Edge functions support
- Split testing

### Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Commands
```bash
# Build image
docker build -t piewallah .

# Run container
docker run -p 80:80 piewallah

# With environment variables
docker run -p 80:80 \
  -e VITE_API_BASE_URL=https://api.penpencil.co \
  piewallah
```

## Video Streaming & Media Features

### Supported Formats
- **HLS (.m3u8)** - HTTP Live Streaming
- **DASH (.mpd)** - Dynamic Adaptive Streaming
- **MP4** - Direct video playback
- **Live Streams** - Real-time video streaming

### Video Player Features
- **Shaka Player Integration** - Advanced video player
- **DRM Support** - Protected content playback
- **Low Latency** - Optimized for live streaming
- **Mobile Optimization** - Landscape fullscreen on mobile
- **Cross-Origin Support** - Secure video playback
- **Error Handling** - Comprehensive error recovery

### Performance Optimizations
- **Adaptive Bitrate** - Automatic quality adjustment
- **Caching Strategy** - Optimized cache headers
- **CDN Integration** - Global content delivery
- **Compression** - Reduced bandwidth usage

## Post-Deployment Testing

### 1. Basic Functionality Tests
```bash
# Test application loads
curl -I https://your-domain.com

# Test API endpoints (use authenticated endpoints)
curl -H "Authorization: Bearer <token>" \
     https://your-api-domain.com/health

# Test video streaming (use your video CDN)
curl -I https://your-video-cdn.com/manifest.m3u8
```

### 2. Video Playback Tests
- **Desktop**: Test video playback in Chrome, Firefox, Safari
- **Mobile**: Test on iOS and Android devices
- **Tablets**: Test landscape orientation
- **Network**: Test on slow and fast connections

### 3. Authentication Tests
- **Login Flow**: Test user authentication
- **Token Refresh**: Verify token renewal
- **Protected Routes**: Test authenticated API calls
- **Error Handling**: Test invalid credentials

### 4. Performance Tests
- **Load Time**: Page load should be < 3 seconds
- **Video Startup**: Video should start in < 2 seconds
- **Mobile Performance**: Test on 3G/4G networks
- **Accessibility**: Test screen readers and keyboard navigation

## Troubleshooting

### Common Issues & Solutions

#### 1. Video Not Playing
**Symptoms**: Black screen, loading spinner, error messages

**Solutions**:
```bash
# Check manifest URL accessibility
curl -I "https://your-video-cdn.com/manifest.m3u8"

# Check CORS headers
curl -H "Origin: https://your-domain.com" \
     -I "https://your-video-cdn.com/manifest.m3u8"

# Verify Shaka Player configuration
console.log('Shaka Player version:', shaka.Player.version);
```

#### 2. Authentication Errors (401/403)
**Symptoms**: 401 Unauthorized, 403 Forbidden

**Solutions**:
- Verify environment variables are set
- Check token format and expiration
- Verify API headers are being sent
- Test with Postman or curl

#### 3. Build Failures
**Symptoms**: Deployment fails, build errors

**Solutions**:
```bash
# Local build test
npm run build

# Check Node.js version
node --version  # Should be 18+

# Clear dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. Performance Issues
**Symptoms**: Slow loading, buffering, high latency

**Solutions**:
- Enable CDN caching
- Optimize video bitrates
- Implement lazy loading
- Monitor bundle size

### Debugging Tools

#### Browser DevTools
```javascript
// Network tab: Filter by XHR and Media
// Console: Look for Shaka Player logs
// Performance: Analyze load times
```

#### Platform-Specific Logs
```bash
# Vercel logs
vercel logs

# Netlify logs
netlify logs

# Docker logs
docker logs <container-id>
```

## Monitoring & Analytics

### Key Metrics to Track
- **Page Load Time**: < 3 seconds
- **Video Start Time**: < 2 seconds
- **Buffer Ratio**: < 5%
- **Error Rate**: < 1%
- **User Engagement**: Watch time, completion rate

### Recommended Tools
- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: User behavior tracking
- **Sentry**: Error tracking and reporting
- **Lighthouse**: Performance auditing

## Security Considerations

### API Security
- **Rate Limiting**: Implement API rate limits
- **CORS**: Configure proper CORS headers
- **Authentication**: Secure token handling
- **Input Validation**: Sanitize all inputs

### Video Security
- **DRM**: Use DRM for protected content
- **Signed URLs**: Time-limited access to videos
- **Domain Restrictions**: Limit video embedding
- **Watermarking**: Consider video watermarking

---

## Deployment Checklist

### Pre-Deployment ✅
- [ ] Repository cloned from `https://github.com/satyamrojhax/piewallahapp.git`
- [ ] Dependencies installed (`npm install`)
- [ ] Build tested locally (`npm run build`)
- [ ] Environment variables configured
- [ ] Video streaming tested locally

### Post-Deployment ✅
- [ ] Application loads successfully
- [ ] Video playback working
- [ ] Authentication functioning
- [ ] Mobile responsive design
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Monitoring and analytics set up

### Platform-Specific Checks
- **Vercel**: [ ] Environment variables set in dashboard
- **Netlify**: [ ] Build settings configured
- **Docker**: [ ] Container running and accessible
- **Custom**: [ ] Web server configured correctly

## Support & Resources

### 📚 Documentation
- **Project README**: [README.md](./README.md)
- **API Documentation**: Available in project source
- **Component Documentation**: Inline code comments

### 🆘 Getting Help
- **Issues**: [GitHub Issues](https://github.com/satyamrojhax/piewallahapp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/satyamrojhax/piewallahapp/discussions)
- **Email**: epowerxlabs@gmail.com
- **Developer**: [Satyam RojhaX](https://instagram.com/satyamrojha.dev)

### 🚀 Deployment Services
- **Vercel**: [vercel.com](https://vercel.com)
- **Netlify**: [netlify.com](https://netlify.com)
- **Railway**: [railway.app](https://railway.app)
- **DigitalOcean**: [digitalocean.com](https://digitalocean.com)

### 📊 Monitoring Tools
- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: User behavior tracking
- **Sentry**: Error tracking and reporting
- **Lighthouse**: Performance auditing

---

**🎉 Ready to Deploy!**

Your Pie Wallah educational platform is now ready for deployment. Follow the platform-specific guides above or use the one-click deployment options for the fastest setup.

For production deployments, ensure all environment variables are properly configured and security measures are in place.

**Happy Deploying! 🚀**
