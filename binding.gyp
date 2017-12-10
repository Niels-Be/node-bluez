{
  'targets': [
    {
      'target_name': 'RawFd',
      'sources': [
        'src/raw-fd.cc'
      ],
      "include_dirs" : [
            "<!(node -e \"require('nan')\")"
        ]
    }
  ]
}