# Clubhouse Protocol

[![Known Vulnerabilities](https://snyk.io//test/github/clubhouse-protocol/protocol/badge.svg?targetFile=package.json)](https://snyk.io//test/github/clubhouse-protocol/protocol?targetFile=package.json) [![Build Status](https://travis-ci.org/clubhouse-protocol/protocol.svg?branch=master)](https://travis-ci.org/clubhouse-protocol/protocol) [![Maintainability](https://api.codeclimate.com/v1/badges/8e855b081f4ae0f63e06/maintainability)](https://codeclimate.com/github/clubhouse-protocol/protocol/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/8e855b081f4ae0f63e06/test_coverage)](https://codeclimate.com/github/clubhouse-protocol/protocol/test_coverage) [![Sonarcloud Status](https://sonarcloud.io/api/project_badges/measure?project=clubhouse-protocol_protocol&metric=alert_status)](https://sonarcloud.io/dashboard?id=clubhouse-protocol_protocol)


**IMPORTANT**: This is a _crypto-protocol_ created by a **non-security-expert**, which means that you should NOT use this for anything that requires actual security.

Hopefully I can someday get someone with more knowledge than me to review the project and say if it is secure (most likely not), if it can be made secure (hopefully) or it is just an awful idea all in all (quite possible)

## Description

## Installing

## Usage

**Example of interaction where an identity and a channel is created, and a new user is added**
```javascript
import { 
  createIdentity,
  loadIdentity,
  createChannel,
  loadChannel,
} from '@clubhouse-protocol';
import {
  addMember,
} from '@clubhouse/rules/dictatorship';

const run = async () => {
  const transporter = getTransporterFromSomewhere();
  const identityKey = await createIdentity({
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'Password1',
  });
  // store identity somewhere
  
  const identity = await loadIdentity(identityKey, 'Passwrod1');
  const channelKey = await createChannel(identity);
  // store channel key

  const channel = await loadChannel(identity, channelKey, transporter);

  const memberToAdd = await loadIdentity('other-persons-public-key');

  await channel.send(addMember(memberToAdd));
  const invitation = channel.pack(memberToAdd);

  // send invitation over some other channel to memberToAdd
}
```

**user joining**
```javascript
const identityKey = await createIdentity({
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  password: 'Password1',
});
// store identity somewhere
  
const identity = await loadIdentity(identityKey, 'Passwrod1');
const publicKey = identity.publicKey.armor();
// send public key to person who will then send an invite back
const inviter = await loadIdentity('inviters-public-key');

const channel = await loadChannel(identity, invitation, transporter, inviter);
const newMessages = await channel.update();
```
