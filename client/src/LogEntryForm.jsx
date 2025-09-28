import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { createLogEntry } from './API';

const LogEntryForm = ({ location, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(''); // '', 'success', 'error', 'uploading'
  const { register, handleSubmit } = useForm();

  // 处理图片文件选择
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  // 处理文件
  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      // 检查文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('图片文件不能超过 5MB');
        setUploadStatus('error');
        return;
      }
      // 创建预览URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setError(''); // 清除错误信息
      setUploadStatus('success');
    } else {
      setError('请选择有效的图片文件');
      setUploadStatus('error');
      setImagePreview(null);
    }
  };

  // 拖拽处理
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
      // 手动设置文件到input
      const fileInput = document.getElementById('image');
      fileInput.files = files;
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      data.latitude = location.latitude;
      data.longitude = location.longitude;
      
      // 创建FormData对象来支持文件上传
      const formData = new FormData();
      
      // 添加API密钥
      formData.append('apiKey', data.apiKey);
      
      // 添加所有表单字段
      Object.keys(data).forEach(key => {
        if (key === 'apiKey') {
          // API密钥已经单独处理了
          return;
        } else if (key === 'image' && data[key] && data[key][0]) {
          // 如果是文件，添加文件对象
          formData.append('image', data[key][0]);
        } else if (data[key] !== undefined && data[key] !== '') {
          // 添加其他字段
          formData.append(key, data[key]);
        }
      });
      
      await createLogEntry(formData);
      onClose();
    } catch (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="entry-form">
      { error ? <h3 className="error">{error}</h3> : null}
      <label htmlFor="apiKey">API KEY</label>
      <input type="password" name="apiKey" required {...register('apiKey')} />
      <label htmlFor="title">Title</label>
      <input name="title" required {...register('title')} />
      <label htmlFor="comments">Comments</label>
      <textarea name="comments" rows={3} {...register('comments')}></textarea>
      <label htmlFor="description">Description</label>
      <textarea name="description" rows={3} {...register('description')}></textarea>
      
      <label htmlFor="image">Image</label>
      <div className={`file-input-wrapper ${uploadStatus}`}>
        <input 
          type="file" 
          name="image" 
          id="image"
          accept="image/*"
          {...register('image')}
          onChange={handleImageChange}
          className="file-input"
        />
        <label 
          htmlFor="image" 
          className="file-input-label"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="file-input-icon">
            {uploadStatus === 'success' ? '✅' : uploadStatus === 'error' ? '❌' : '📷'}
          </div>
          <div className="file-input-text">
            {uploadStatus === 'success' && imagePreview ? '图片已选择 - 点击更换' : 
             uploadStatus === 'error' ? '选择图片失败 - 请重试' :
             imagePreview ? '点击更换图片' : '点击或拖拽上传图片'}
          </div>
          <div className="file-input-hint">
            支持 JPG, PNG, GIF 格式，最大 5MB
          </div>
        </label>
      </div>
      
      {/* 图片预览 */}
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Preview" />
          <div className="image-preview-info">
            图片预览 - 点击右上角删除
          </div>
          <button 
            type="button" 
            onClick={() => {
              setImagePreview(null);
              setUploadStatus('');
              setError('');
              document.querySelector('input[name="image"]').value = '';
            }}
            className="remove-image"
            title="删除图片"
          >
            ✕
          </button>
        </div>
      )}
      
      <label htmlFor="visitDate">Visit Date</label>
      <input name="visitDate" type="date" required {...register('visitDate')} />
      <button disabled={loading}>{loading ? 'Loading...' : 'Create Entry'}</button>
    </form>
  );
};

export default LogEntryForm;
