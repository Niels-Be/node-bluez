#ifndef ___RAW_FD_H___
#define ___RAW_FD_H___

#include <node.h>
#include <nan.h>

class RawFd : public node::ObjectWrap {

public:
    static void Init(v8::Local<v8::Object> exports, v8::Local<v8::Object> module);
    static NAN_METHOD(New);
    static NAN_METHOD(Start);
    static NAN_METHOD(Stop);
    static NAN_METHOD(Write);
    static NAN_METHOD(Close);

private:
    RawFd(int fd, const v8::Local<v8::Function>& readCallback);
    ~RawFd();

    void start();
    void stop();

    int write_(char* data, int length);
    bool close_();

    void poll();

    void emitErrnoError();

    static void PollCloseCallback(uv_poll_t* handle);
    static void PollCallback(uv_poll_t* handle, int status, int events);

private:
  Nan::Persistent<v8::Object> This;

  int _fd;
  Nan::Callback _readCallback;

  bool isReading;
  uv_poll_t _pollHandle;
  
  static Nan::Persistent<v8::FunctionTemplate> constructor_template;
};

#endif