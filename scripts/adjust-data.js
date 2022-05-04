const fs = require('fs')

const arr = [
  { name: 'verbose', description: 'increase verbosity' },
  { name: 'quiet', description: 'suppress non-error messages' },
  { name: 'no-motd', description: 'suppress daemon-mode MOTD (see caveat)' },
  { name: 'checksum', description: 'skip based on checksum, not mod-time & size' },
  { name: 'archive', description: 'archive mode; equals -rlptgoD (no -H,-A,-X)' },
  { name: 'recursive', description: 'recurse into directories' },
  { name: 'relative', description: 'use relative path names' },
  { name: 'no-implied-dirs', description: "don't send implied dirs with --relative" },
  { name: 'backup', description: 'make backups (see --suffix & --backup-dir)' },
  { name: 'backup-dir', param: 'dir', description: 'make backups into hierarchy based in DIR' },
  { name: 'suffix', param: 'suffix', description: 'backup suffix (default ~ w/o --backup-dir)' },
  { name: 'update', description: 'skip files that are newer on the receiver' },
  { name: 'inplace', description: 'update destination files in-place' },
  { name: 'append', description: 'append data onto shorter files' },
  { name: 'append-verify', description: '--append w/old data in file checksum' },
  { name: 'dirs', description: 'transfer directories without recursing' },
  { name: 'links', description: 'copy symlinks as symlinks' },
  { name: 'copy-links', description: 'transform symlink into referent file/dir' },
  { name: 'copy-unsafe-links', description: 'only "unsafe" symlinks are transformed' },
  { name: 'safe-links', description: 'ignore symlinks that point outside the tree' },
  { name: 'copy-dirlinks', description: 'transform symlink to dir into referent dir' },
  { name: 'keep-dirlinks', description: 'treat symlinked dir on receiver as dir' },
  { name: 'hard-links', description: 'preserve hard links' },
  { name: 'perms', description: 'preserve permissions' },
  { name: 'executability', description: 'preserve executability' },
  { name: 'chmod', param: 'chmod', description: 'affect file and/or directory permissions' },
  { name: 'acls', description: 'preserve ACLs (implies -p)' },
  { name: 'xattrs', description: 'preserve extended attributes' },
  { name: 'owner', description: 'preserve owner (super-user only)' },
  { name: 'group', description: 'preserve group' },
  { name: 'devices', description: 'preserve device files (super-user only)' },
  { name: 'specials', description: 'preserve special files' },
  { name: 'times', description: 'preserve modification times' },
  { name: 'omit-dir-times', description: 'omit directories from --times' },
  { name: 'super', description: 'receiver attempts super-user activities' },
  { name: 'fake-super', description: 'store/recover privileged attrs using xattrs' },
  { name: 'sparse', description: 'handle sparse files efficiently' },
  { name: 'dry-run', description: 'perform a trial run with no changes made' },
  { name: 'whole-file', description: 'copy files whole (w/o delta-xfer algorithm)' },
  { name: 'one-file-system', description: "don't cross filesystem boundaries" },
  { name: 'block-size', param: 'size', description: 'force a fixed checksum block-size' },
  { name: 'rsh', param: 'command', description: 'specify the remote shell to use' },
  {
    name: 'rsync-path',
    param: 'program',
    description: 'specify the rsync to run on remote machine',
  },
  { name: 'existing', description: 'skip creating new files on receiver' },
  { name: 'ignore-existing', description: 'skip updating files that exist on receiver' },
  { name: 'remove-source-files', description: 'sender removes synchronized files (non-dir)' },
  { name: 'del', description: 'an alias for --delete-during' },
  { name: 'delete', description: 'delete extraneous files from dest dirs' },
  { name: 'delete-before', description: 'receiver deletes before transfer (default)' },
  { name: 'delete-during', description: 'receiver deletes during xfer, not before' },
  { name: 'delete-delay', description: 'find deletions during, delete after' },
  { name: 'delete-after', description: 'receiver deletes after transfer, not before' },
  { name: 'delete-excluded', description: 'also delete excluded files from dest dirs' },
  { name: 'ignore-errors', description: 'delete even if there are I/O errors' },
  { name: 'force', description: 'force deletion of dirs even if not empty' },
  { name: 'max-delete', param: 'num', description: "don't delete more than NUM files" },
  { name: 'max-size', param: 'size', description: "don't transfer any file larger than SIZE" },
  { name: 'min-size', param: 'size', description: "don't transfer any file smaller than SIZE" },
  { name: 'partial', description: 'keep partially transferred files' },
  { name: 'partial-dir', param: 'dir', description: 'put a partially transferred file into DIR' },
  { name: 'delay-updates', description: 'put all updated files into place at end' },
  { name: 'prune-empty-dirs', description: 'prune empty directory chains from file-list' },
  { name: 'numeric-ids', description: "don't map uid/gid values by user/group name" },
  { name: 'timeout', param: 'seconds', description: 'set I/O timeout in seconds' },
  { name: 'contimeout', param: 'seconds', description: 'set daemon connection timeout in seconds' },
  { name: 'ignore-times', description: "don't skip files that match size and time" },
  { name: 'size-only', description: 'skip files that match in size' },
  { name: 'modify-window', param: 'num', description: 'compare mod-times with reduced accuracy' },
  { name: 'temp-dir', param: 'dir', description: 'create temporary files in directory DIR' },
  { name: 'fuzzy', description: 'find similar file for basis if no dest file' },
  {
    name: 'compare-dest',
    param: 'dir',
    description: 'also compare received files relative to DIR',
  },
  { name: 'copy-dest', param: 'dir', description: '... and include copies of unchanged files' },
  { name: 'link-dest', param: 'dir', description: 'hardlink to files in DIR when unchanged' },
  { name: 'compress', description: 'compress file data during the transfer' },
  { name: 'compress-level', param: 'num', description: 'explicitly set compression level' },
  {
    name: 'skip-compress',
    param: 'list',
    description: 'skip compressing files with suffix in LIST',
  },
  { name: 'cvs-exclude', description: 'auto-ignore files in the same way CVS does' },
  { name: 'filter', param: 'rule', description: 'add a file-filtering RULE' },
  { name: 'exclude', param: 'pattern', description: 'exclude files matching PATTERN' },
  { name: 'exclude-from', param: 'file', description: 'read exclude patterns from FILE' },
  { name: 'include', param: 'pattern', description: "don't exclude files matching PATTERN" },
  { name: 'include-from', param: 'file', description: 'read include patterns from FILE' },
  { name: 'files-from', param: 'file', description: 'read list of source-file names from FILE' },
  { name: 'from0', description: 'all *from/filter files are delimited by 0s' },
  { name: 'protect-args', description: 'no space-splitting; wildcard chars only' },
  { name: 'address', param: 'address', description: 'bind address for outgoing socket to daemon' },
  { name: 'port', param: 'port', description: 'specify double-colon alternate port number' },
  { name: 'sockopts', param: 'options', description: 'specify custom TCP options' },
  { name: 'blocking-io', description: 'use blocking I/O for the remote shell' },
  { name: 'stats', description: 'give some file-transfer stats' },
  { name: '8-bit-output', description: 'leave high-bit chars unescaped in output' },
  { name: 'human-readable', description: 'output numbers in a human-readable format' },
  { name: 'progress', description: 'show progress during transfer' },
  { name: 'itemize-changes', description: 'output a change-summary for all updates' },
  { name: 'out-format', param: 'format', description: 'output updates using the specified FORMAT' },
  { name: 'log-file', param: 'file', description: "log what we're doing to the specified FILE" },
  { name: 'log-file-format', param: 'fmt', description: 'log updates using the specified FMT' },
  { name: 'password-file', param: 'file', description: 'read daemon-access password from FILE' },
  { name: 'list-only', description: 'list the files instead of copying them' },
  { name: 'bwlimit', param: 'kbps', description: 'limit I/O bandwidth; KBytes per second' },
  { name: 'write-batch', param: 'file', description: 'write a batched update to FILE' },
  {
    name: 'only-write-batch',
    param: 'file',
    description: 'like --write-batch but w/o updating dest',
  },
  { name: 'read-batch', param: 'file', description: 'read a batched update from FILE' },
  { name: 'protocol', param: 'num', description: 'force an older protocol version to be used' },
  { name: 'iconv', param: 'convert_spec', description: 'request charset conversion of filenames' },
  { name: 'checksum-seed', param: 'num', description: 'set block/file checksum seed (advanced)' },
  { name: 'ipv4', description: 'prefer IPv4' },
  { name: 'ipv6', description: 'prefer IPv6' },
  { name: 'daemon', description: 'run as an rsync daemon' },
  { name: 'config', param: 'file', description: 'specify alternate rsyncd.conf file' },
  { name: 'no-detach', description: 'do not detach from the parent' },
]

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1)
}

// const newArr = arr.map(o => ({ ...o, description: capitalize(o.description) }))

const newArr = arr.map(o => ({ ...o, description: `${capitalize(o.description)}.` }))

fs.writeFile('./adjust-data-result.json', JSON.stringify(newArr), err => {
  if (err) {
    console.error(err)
  }
})