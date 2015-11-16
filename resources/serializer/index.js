var _ = require('underscore'),
  private = {
    generatingObj : function (obj,serializeRule,newObj) {
      var self = this;
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
        
          if(!!serializeRule[property] && Array.isArray(serializeRule[property])
            && _.intersection(serializeRule[property], self.groups).length){
            
            if(self.serializeNull || obj[property] !== null)
              newObj[property] = obj[property];
          }

          if (typeof obj[property] === "object" && !!serializeRule[property] 
            && !Array.isArray(serializeRule[property]) && typeof serializeRule[property] === "object"){  
            newObj[property] = private.generatingObj.call(self,obj[property],self.serializeRules[property],{});
          }
          
          if (Array.isArray(obj[property]) && !!serializeRule[property] 
            && !Array.isArray(serializeRule[property]) && typeof serializeRule[property] === "object"){
            newObj[property] = private.arrayIterating.call(self,obj[property],self.serializeRules[property],[]);
          }
        }
      }
      return newObj;
    },
    arrayIterating : function(arr,serializeRule,newArr){
      var self = this;
      for (var i = 0,count = arr.length;i<count;i++){
        newArr[i] = private.generatingObj.call(self,arr[i],serializeRule,{});
      }
      return newArr;
    }
    
  };
function Serializer(fileName){
  
  if (!(this instanceof Serializer)) return new Serializer(fileName);
 
  var self = this;
  self.groups = null;
  self.serializeNull = true;
  self.generatedObj = {};
  
  try {
    self.serializeRules = require('./'+fileName);
  } catch(err) {
    throw new Error('serialize file does not exist');
  }
  return self;
};
Serializer.prototype.setSerializeNull = function(type){
  this.serializeNull = !!type;
  return this;
};

Serializer.prototype.setGroups = function(groups){
  if(!Array.isArray(groups)){
    throw new Error('groups must be array');
  }
  this.groups = groups;
  return this;
};
Serializer.prototype.serialize = function(data){
  this.generatedObj = private.generatingObj.call(this,data,this.serializeRules,{},null);
  return JSON.stringify(this.generatedObj);
};

module.exports = Serializer;