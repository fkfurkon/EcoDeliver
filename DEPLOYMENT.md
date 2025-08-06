# 🚀 Auto Deployment Setup

โปรเจค EcoDeliver ได้ถูกตั้งค่า **Auto Deployment** เรียบร้อยแล้ว!

## 🌟 Features

### 1. **Automatic Production Deployment**
- ✅ Deploy อัตโนมัติเมื่อมีการ push ไปยัง `main` branch
- ✅ Build และ deploy ไปยัง Firebase Hosting
- ✅ URL: https://eco-delivery-25d64.web.app

### 2. **PR Preview Deployment**
- ✅ สร้าง preview URL สำหรับทุก Pull Request
- ✅ ทดสอบการเปลี่ยนแปลงก่อน merge
- ✅ แสดง comment พร้อม preview link ใน PR

### 3. **Manual Deployment**
- ✅ สามารถ trigger deployment ด้วยตนเองได้
- ✅ ผ่าน GitHub Actions tab

## 📋 Workflow Files

### 🚀 Production Deployment
**File:** `.github/workflows/firebase-hosting-merge.yml`

```yaml
name: 🚀 Deploy to Firebase Hosting on merge
on:
  push:
    branches: [main]
  workflow_dispatch: # Manual trigger
```

### 🔍 PR Preview
**File:** `.github/workflows/firebase-hosting-pull-request.yml`

```yaml
name: 🔍 Deploy to Firebase Hosting on PR
on: pull_request
```

## 🔧 How It Works

1. **เมื่อคุณ push code ไปยัง main branch:**
   - GitHub Actions จะรัน workflow อัตโนมัติ
   - Build React application (`npm run build`)
   - Deploy ไปยัง Firebase Hosting
   - อัพเดท live site: https://eco-delivery-25d64.web.app

2. **เมื่อคุณสร้าง Pull Request:**
   - GitHub Actions จะสร้าง preview deployment
   - แสดง comment ใน PR พร้อม preview URL
   - ทดสอบได้ก่อน merge เข้า main

## 🔐 Security

- ✅ Firebase Service Account ถูกเก็บใน GitHub Secrets
- ✅ Secret Name: `FIREBASE_SERVICE_ACCOUNT_ECO_DELIVERY_25D64`
- ✅ มีสิทธิ์เฉพาะ Firebase Hosting เท่านั้น

## 📊 Status

[![Deploy Status](https://github.com/fkfurkon/EcoDeliver/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/fkfurkon/EcoDeliver/actions/workflows/firebase-hosting-merge.yml)

## 🎯 Next Steps

1. ✅ Push โค้ดนี้ไปยัง GitHub repository
2. ✅ Auto deployment จะเริ่มทำงานทันที
3. ✅ ตรวจสอบ GitHub Actions tab เพื่อดูสถานะ deployment

---

**🌱 EcoDeliver - Green Delivery Platform**
