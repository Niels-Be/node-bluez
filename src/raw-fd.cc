#include <errno.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>

#include <node_buffer.h>
#include <nan.h>

#include "raw-fd.h"

using namespace v8;

Nan::Persistent<FunctionTemplate> RawFd::constructor_template;

RawFd::RawFd(int fd, const Local<Function>& readCallback) :
  node::ObjectWrap(),
  _fd(fd),
  _readCallback(readCallback),
  isReading(false) {

  uv_poll_init(uv_default_loop(), &this->_pollHandle, this->_fd);

  this->_pollHandle.data = this;
}

RawFd::~RawFd() {
  uv_close((uv_handle_t*)&this->_pollHandle, (uv_close_cb)RawFd::PollCloseCallback);

  close(this->_fd);
}

void RawFd::start() {
  if(!this->isReading) {
    this->isReading = true;
    uv_poll_start(&this->_pollHandle, UV_READABLE, RawFd::PollCallback);
  }
}


void RawFd::poll() {
  Nan::HandleScope scope;

  int length = 0;
  char data[1024];

  length = read(this->_fd, data, sizeof(data));

  if(length > 0) {
    Local<Value> argv[2] = {
      Nan::New<Number>(0),
      Nan::CopyBuffer(data, length).ToLocalChecked()
    };
  
    this->_readCallback.Call(2, argv);
  } else {
    if(errno == EAGAIN || errno == EWOULDBLOCK) {
      //Ignore those
      return;
    }
    Local<Value> argv[2] = {
      Nan::New<Number>(errno),
      Nan::Null()
    };
  
    this->_readCallback.Call(2, argv);
  }

}

void RawFd::stop() {
  if(this->isReading) {
    this->isReading = false;
    uv_poll_stop(&this->_pollHandle);
  }
}

int RawFd::write_(char* data, int length) {
  return write(this->_fd, data, length);
}

bool RawFd::close_() {
  this->stop();
  //if(shutdown(this->_fd, SHUT_RDWR) != 0)
  //  return false;
  if(close(this->_fd) != 0)
    return false;
  return true;
}


NAN_METHOD(RawFd::New) {
  Nan::HandleScope scope;

  if (info.Length() != 2) {
    return Nan::ThrowTypeError("usage: RawFd(fd, readCallback)");
  }

    

  Local<Value> arg0 = info[0];
  if (! (arg0->IsInt32() || arg0->IsUint32())) {
    return Nan::ThrowTypeError("usage: RawFd(fd, readCallback)");
  }
  int fd = arg0->IntegerValue();
  if(fd < 0) {
    return Nan::ThrowTypeError("usage: RawFd(fd, readCallback)");
  }

  
  Local<Value> arg1 = info[1];
  if(!arg1->IsFunction()) {
    return Nan::ThrowTypeError("usage: RawFd(fd, readCallback)");
  }
  
  RawFd* p = new RawFd(fd, arg1.As<Function>());
  p->Wrap(info.This());
  p->This.Reset(info.This());
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(RawFd::Start) {
  Nan::HandleScope scope;

  RawFd* p = node::ObjectWrap::Unwrap<RawFd>(info.This());

  p->start();

  info.GetReturnValue().SetUndefined();
}

NAN_METHOD(RawFd::Stop) {
  Nan::HandleScope scope;

  RawFd* p = node::ObjectWrap::Unwrap<RawFd>(info.This());

  p->stop();

  info.GetReturnValue().SetUndefined();
}

NAN_METHOD(RawFd::Write) {
  RawFd* p = node::ObjectWrap::Unwrap<RawFd>(info.This());

  if (info.Length() > 0) {
    Local<Value> arg0 = info[0];
    if (arg0->IsObject()) {

      int res = p->write_(node::Buffer::Data(arg0), node::Buffer::Length(arg0));
      if(res > 0) {
        info.GetReturnValue().Set(0);
      } else {
        info.GetReturnValue().Set(errno);
      }

    } else {
        return Nan::ThrowTypeError("Can only write Buffers");
    }
  } else {
    return Nan::ThrowTypeError("usage: write(buffer)");
  }
}

NAN_METHOD(RawFd::Close) {
  RawFd* p = node::ObjectWrap::Unwrap<RawFd>(info.This());
  if(!p->close_()) {
    return Nan::ThrowError(Nan::ErrnoException(errno));
  }
  
  info.GetReturnValue().SetUndefined();  
}


void RawFd::PollCloseCallback(uv_poll_t* handle) {
  delete handle;
}

void RawFd::PollCallback(uv_poll_t* handle, int status, int events) {
  RawFd *p = (RawFd*)handle->data;

  p->poll();
}

void RawFd::Init(v8::Local<v8::Object> exports, v8::Local<v8::Object> module) {
  Nan::HandleScope scope;
  
  Local<FunctionTemplate> tmpl = Nan::New<FunctionTemplate>(New);
  constructor_template.Reset(tmpl);

  tmpl->InstanceTemplate()->SetInternalFieldCount(1);
  tmpl->SetClassName(Nan::New("RawFd").ToLocalChecked());

  Nan::SetPrototypeMethod(tmpl, "start", Start);
  Nan::SetPrototypeMethod(tmpl, "stop", Stop);
  Nan::SetPrototypeMethod(tmpl, "write", Write);
  Nan::SetPrototypeMethod(tmpl, "close", Close);

  module->Set(Nan::New("exports").ToLocalChecked(), tmpl->GetFunction());
}

NODE_MODULE(RawFd, RawFd::Init);